import { readDiffDecision } from './review-decisions'
import { randomBytes, randomUUID } from 'node:crypto'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { Errors } from '@/lib/errors'
import type { ParsedRow } from '@/features/imports/types'
import { canonicalInstitutionName } from './normalize-institution'
import { readBatches, writeBatches } from './read-batches'

export type FinalizeResult = {
  institutionsCreated: number
  teamsCreated: number
  participantsCreated: number
  adjudicatorsCreated: number
  recordsUpdatedViaReimport: number
  rowsImported: number
  rowsSkipped: number
}

type InstitutionState = {
  id: string
  name: string
  teamsIntended: number | null
  adjudicatorsIntended: number | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
}
type TeamState = {
  id: string
  tournamentInstitutionId: string
  name: string
  isNovice: boolean
  importPhase: string
}
type ParticipantState = {
  id: string
  tournamentInstitutionId: string
  teamId: string | null
  displayName: string
  email: string | null
  phone: string | null
  importPhase: string
}
type AdjudicatorState = {
  tournamentInstitutionId: string | null
  id: string
  displayName: string
  email: string | null
  phone: string | null
  importPhase: string
}

function inferPhaseFromLabel(label: string) {
  const name = label.toLowerCase()
  if (name.includes('phase 1') || name.includes('intent')) return 'phase-1'
  if (name.includes('phase 3') || name.includes('correction')) return 'phase-3'
  return 'phase-2'
}

function firstBy<T>(rows: T[], key: (row: T) => string | null) {
  const result = new Map<string, T>()
  for (const row of rows) {
    const value = key(row)
    if (value !== null && !result.has(value)) result.set(value, row)
  }
  return result
}

export async function finalizeImport(
  importId: string,
): Promise<{ summary: FinalizeResult; institutionIds: string[] }> {
  return prisma.$transaction(
    async (tx) => {
      const claim = await tx.csvImport.updateMany({
        where: { id: importId, status: 'PROCESSED' },
        data: { status: 'FINALIZED', finalizedAt: new Date() },
      })
      if (claim.count !== 1) throw Errors.conflict('Import is not in PROCESSED state')
      const record = await tx.csvImport.findUniqueOrThrow({
        where: { id: importId },
        select: { tournamentId: true, phaseLabel: true },
      })
      const tournamentId = record.tournamentId
      const phase = inferPhaseFromLabel(record.phaseLabel)
      const rows = await readBatches((cursor, take) =>
        tx.csvImportRow.findMany({
          where: { importId },
          orderBy: [{ rowIndex: 'asc' }, { id: 'asc' }],
          take,
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        }),
      )
      const institutions = await readBatches((cursor, take) =>
        tx.tournamentInstitution.findMany({
          where: { tournamentId },
          orderBy: { id: 'asc' },
          take,
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
          select: {
            id: true,
            name: true,
            teamsIntended: true,
            adjudicatorsIntended: true,
            contactName: true,
            contactEmail: true,
            contactPhone: true,
          },
        }),
      )
      const aliases = await readBatches((cursor, take) =>
        tx.institutionAlias.findMany({
          where: { tournamentId },
          orderBy: { id: 'asc' },
          take,
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
          select: { id: true, alias: true, resolvedInstitutionId: true },
        }),
      )
      const teams =
        phase === 'phase-1'
          ? []
          : await readBatches((cursor, take) =>
              tx.team.findMany({
                where: { institution: { tournamentId } },
                orderBy: { id: 'asc' },
                take,
                ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
                select: {
                  id: true,
                  name: true,
                  tournamentInstitutionId: true,
                  isNovice: true,
                  importPhase: true,
                },
              }),
            )
      const participants =
        phase === 'phase-1'
          ? []
          : await readBatches((cursor, take) =>
              tx.participant.findMany({
                where: { institution: { tournamentId } },
                orderBy: [{ displayName: 'asc' }, { id: 'asc' }],
                take,
                ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
                select: {
                  id: true,
                  tournamentInstitutionId: true,
                  teamId: true,
                  displayName: true,
                  email: true,
                  phone: true,
                  importPhase: true,
                },
              }),
            )
      const adjudicators =
        phase === 'phase-1'
          ? []
          : await readBatches((cursor, take) =>
              tx.adjudicator.findMany({
                where: { tournamentId },
                orderBy: { id: 'asc' },
                take,
                ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
                select: {
                  id: true,
                  tournamentInstitutionId: true,
                  displayName: true,
                  email: true,
                  phone: true,
                  importPhase: true,
                },
              }),
            )
      const institutionNames = firstBy(institutions, (row) => row.name.toLowerCase())
      const institutionIds = new Map(institutions.map((row) => [row.id, row]))
      const aliasIds = new Map(aliases.map((row) => [row.alias, row.resolvedInstitutionId]))
      const teamNames = firstBy(teams, (row) =>
        JSON.stringify([row.tournamentInstitutionId, row.name]),
      )
      const participantEmails = firstBy(participants, (row) =>
        row.email ? JSON.stringify([row.tournamentInstitutionId, row.email]) : null,
      )
      const adjudicatorEmails = firstBy(adjudicators, (row) => row.email)
      const speakersByTeam = new Map<string, ParticipantState[]>()
      for (const participant of participants) {
        if (!participant.teamId) continue
        const roster = speakersByTeam.get(participant.teamId) ?? []
        roster.push(participant)
        speakersByTeam.set(participant.teamId, roster)
      }
      const newInstitutions: Array<Prisma.TournamentInstitutionCreateManyInput & InstitutionState> =
        []
      const newTeams: Array<Prisma.TeamCreateManyInput & TeamState> = []
      const newParticipants: Array<Prisma.ParticipantCreateManyInput & ParticipantState> = []
      const newAdjudicators: Array<Prisma.AdjudicatorCreateManyInput & AdjudicatorState> = []
      const institutionUpdates = new Map<string, InstitutionState>()
      const teamUpdates = new Map<string, TeamState>()
      const participantUpdates = new Map<string, ParticipantState>()
      const adjudicatorUpdates = new Map<string, AdjudicatorState>()
      const newIds = new Set<string>()
      const affectedInstitutions = new Set<string>()
      const importedIds: string[] = [],
        skippedIds: string[] = []
      const result: FinalizeResult = {
        institutionsCreated: 0,
        teamsCreated: 0,
        participantsCreated: 0,
        adjudicatorsCreated: 0,
        recordsUpdatedViaReimport: 0,
        rowsImported: 0,
        rowsSkipped: rows.filter((row) => row.status === 'SKIPPED').length,
      }

      for (const row of rows) {
        if (!['PENDING', 'WARNING', 'RESUBMISSION'].includes(row.status)) continue
        const parsed = row.rawJson as unknown as ParsedRow
        if (!parsed.registrationType) {
          result.rowsSkipped++
          skippedIds.push(row.id)
          continue
        }
        let institution: InstitutionState | undefined
        if (parsed.institutionName) {
          const aliasId = row.messages.includes('NORMALIZATION_DECISION:reject')
            ? undefined
            : aliasIds.get(canonicalInstitutionName(parsed.institutionName))
          institution = aliasId
            ? institutionIds.get(aliasId)
            : institutionNames.get(parsed.institutionName.toLowerCase())
          if (!institution) {
            const data: Prisma.TournamentInstitutionCreateManyInput & InstitutionState = {
              id: randomUUID(),
              tournamentId,
              name: parsed.institutionName,
              teamsIntended: parsed.teamsIntended,
              adjudicatorsIntended: parsed.adjudicatorsIntended,
              contactName: parsed.representative.name,
              contactEmail: parsed.representative.email,
              contactPhone: parsed.representative.phone,
            }
            newInstitutions.push(data)
            newIds.add(data.id)
            institution = data
            institutionNames.set(data.name.toLowerCase(), data)
            institutionIds.set(data.id, data)
            result.institutionsCreated++
          } else if (phase === 'phase-1') {
            Object.assign(institution, {
              teamsIntended: parsed.teamsIntended ?? institution.teamsIntended,
              adjudicatorsIntended: parsed.adjudicatorsIntended ?? institution.adjudicatorsIntended,
              contactName: parsed.representative.name ?? institution.contactName,
              contactEmail: parsed.representative.email ?? institution.contactEmail,
              contactPhone: parsed.representative.phone ?? institution.contactPhone,
            })
            if (!newIds.has(institution.id)) institutionUpdates.set(institution.id, institution)
          }
        }
        if (institution) affectedInstitutions.add(institution.id)
        const decision = readDiffDecision(row.messages)
        if (
          phase !== 'phase-1' &&
          institution &&
          parsed.registrationType !== 'independent_adjudicator'
        ) {
          for (const incoming of parsed.logicalTeams) {
            if (!incoming.teamName) continue
            const key = JSON.stringify([institution.id, incoming.teamName])
            let team = teamNames.get(key)
            if (!team) {
              const data: Prisma.TeamCreateManyInput & TeamState = {
                id: randomUUID(),
                tournamentInstitutionId: institution.id,
                name: incoming.teamName,
                isNovice: incoming.isNovice,
                importPhase: phase,
              }
              newTeams.push(data)
              newIds.add(data.id)
              teamNames.set(key, data)
              team = data
              result.teamsCreated++
            } else {
              Object.assign(team, { isNovice: incoming.isNovice, importPhase: phase })
              if (!newIds.has(team.id)) teamUpdates.set(team.id, team)
              result.recordsUpdatedViaReimport++
            }
            for (const [index, speaker] of incoming.debaters.entries()) {
              if (!speaker.name) continue
              if (decision?.mode === 'apply-selected') {
                if (!decision.selectedFields.includes(`debater_${index + 1}_name`)) continue
                const existing = speaker.email
                  ? participantEmails.get(JSON.stringify([institution.id, speaker.email]))
                  : speakersByTeam.get(team.id)?.[index]
                if (existing) {
                  existing.displayName = speaker.name
                  if (!newIds.has(existing.id)) participantUpdates.set(existing.id, existing)
                  result.recordsUpdatedViaReimport++
                  continue
                }
              }
              const emailKey = speaker.email
                ? JSON.stringify([institution.id, speaker.email])
                : null
              const existing = emailKey ? participantEmails.get(emailKey) : undefined
              if (existing) {
                Object.assign(existing, {
                  displayName: speaker.name,
                  phone: speaker.phone ?? existing.phone,
                  teamId: team.id,
                  importPhase: phase,
                })
                if (!newIds.has(existing.id)) participantUpdates.set(existing.id, existing)
                result.recordsUpdatedViaReimport++
              } else {
                const data: Prisma.ParticipantCreateManyInput & ParticipantState = {
                  id: randomUUID(),
                  tournamentInstitutionId: institution.id,
                  teamId: team.id,
                  displayName: speaker.name,
                  email: speaker.email,
                  phone: speaker.phone,
                  eligibility: 'ELIGIBLE',
                  importPhase: phase,
                }
                newParticipants.push(data)
                newIds.add(data.id)
                if (emailKey) participantEmails.set(emailKey, data)
                const roster = speakersByTeam.get(team.id) ?? []
                roster.push(data)
                speakersByTeam.set(team.id, roster)
                result.participantsCreated++
              }
            }
          }
        }
        if (phase !== 'phase-1')
          for (const judge of parsed.judges) {
            if (!judge.name) continue
            const existing = judge.email ? adjudicatorEmails.get(judge.email) : undefined
            if (existing) {
              if (existing.tournamentInstitutionId)
                affectedInstitutions.add(existing.tournamentInstitutionId)
              Object.assign(existing, {
                displayName: judge.name,
                phone: judge.phone ?? existing.phone,
                importPhase: phase,
              })
              if (!newIds.has(existing.id)) adjudicatorUpdates.set(existing.id, existing)
              result.recordsUpdatedViaReimport++
            } else {
              const data: Prisma.AdjudicatorCreateManyInput & AdjudicatorState = {
                id: randomUUID(),
                tournamentId,
                tournamentInstitutionId:
                  parsed.registrationType === 'independent_adjudicator'
                    ? null
                    : (institution?.id ?? null),
                displayName: judge.name,
                email: judge.email,
                phone: judge.phone,
                status: 'ACTIVE',
                importPhase: phase,
              }
              newAdjudicators.push(data)
              newIds.add(data.id)
              if (judge.email) adjudicatorEmails.set(judge.email, data)
              result.adjudicatorsCreated++
            }
          }
        result.rowsImported++
        importedIds.push(row.id)
      }

      await writeBatches(newInstitutions, (data) => tx.tournamentInstitution.createMany({ data }))
      await writeBatches(
        newInstitutions.map((institution) => ({
          tournamentInstitutionId: institution.id,
          token: randomBytes(32).toString('base64url'),
          active: true,
        })),
        (data) => tx.institutionPortalToken.createMany({ data }),
      )
      await writeBatches(newTeams, (data) => tx.team.createMany({ data }))
      await writeBatches(newParticipants, (data) => tx.participant.createMany({ data }))
      await writeBatches(newAdjudicators, (data) => tx.adjudicator.createMany({ data }))
      await writeBatches(
        [...institutionUpdates.values()],
        (batch) => tx.$executeRaw`
      UPDATE tournament_institutions i SET teams_intended=x."teamsIntended", adjudicators_intended=x."adjudicatorsIntended", contact_name=x."contactName", contact_email=x."contactEmail", contact_phone=x."contactPhone", updated_at=NOW()
      FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb) AS x(id text, "teamsIntended" integer, "adjudicatorsIntended" integer, "contactName" text, "contactEmail" text, "contactPhone" text) WHERE i.id=x.id
    `,
      )
      await writeBatches(
        [...teamUpdates.values()],
        (batch) => tx.$executeRaw`
      UPDATE teams t SET is_novice=x."isNovice", import_phase=x."importPhase", updated_at=NOW()
      FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb) AS x(id text, "isNovice" boolean, "importPhase" text) WHERE t.id=x.id
    `,
      )
      await writeBatches(
        [...participantUpdates.values()],
        (batch) => tx.$executeRaw`
      UPDATE participants p SET display_name=x."displayName", phone=x.phone, team_id=x."teamId", import_phase=x."importPhase", updated_at=NOW()
      FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb) AS x(id text, "displayName" text, phone text, "teamId" text, "importPhase" text) WHERE p.id=x.id
    `,
      )
      await writeBatches(
        [...adjudicatorUpdates.values()],
        (batch) => tx.$executeRaw`
      UPDATE adjudicators a SET display_name=x."displayName", phone=x.phone, import_phase=x."importPhase", updated_at=NOW()
      FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb) AS x(id text, "displayName" text, phone text, "importPhase" text) WHERE a.id=x.id
    `,
      )
      await writeBatches(importedIds, (ids) =>
        tx.csvImportRow.updateMany({
          where: { id: { in: ids }, importId },
          data: { status: 'IMPORTED' },
        }),
      )
      await writeBatches(skippedIds, (ids) =>
        tx.csvImportRow.updateMany({
          where: { id: { in: ids }, importId },
          data: { status: 'SKIPPED' },
        }),
      )
      await tx.csvImport.update({ where: { id: importId }, data: { summaryJson: result } })
      return { summary: result, institutionIds: [...affectedInstitutions] }
    },
    { maxWait: 10_000, timeout: 120_000 },
  )
}
