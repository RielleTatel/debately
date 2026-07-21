import { randomBytes } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import type { ParsedRow } from '@/features/imports/types'

function urlSafeToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url')
}

export type FinalizeResult = {
  institutionsCreated: number
  teamsCreated: number
  participantsCreated: number
  adjudicatorsCreated: number
  recordsUpdatedViaReimport: number
  rowsImported: number
  rowsSkipped: number
}

function inferPhaseFromLabel(label: string): 'phase-1' | 'phase-2' | 'phase-3' {
  const s = label.toLowerCase()
  if (s.includes('phase 1') || s.includes('intent')) return 'phase-1'
  if (s.includes('phase 3') || s.includes('correction')) return 'phase-3'
  return 'phase-2'
}

export async function finalizeImport(importId: string): Promise<FinalizeResult> {
  return prisma.$transaction(async (tx) => {
    const importRec = await tx.csvImport.update({
      where: { id: importId },
      data: { status: 'FINALIZED', finalizedAt: new Date() },
    })
    const rows = await tx.csvImportRow.findMany({
      where: { importId, status: { in: ['PENDING', 'WARNING', 'RESUBMISSION'] } },
      orderBy: { rowIndex: 'asc' },
    })
    const phase = inferPhaseFromLabel(importRec.phaseLabel)

    let institutionsCreated = 0, teamsCreated = 0, participantsCreated = 0
    let adjudicatorsCreated = 0, recordsUpdatedViaReimport = 0, rowsImported = 0, rowsSkipped = 0

    for (const row of rows) {
      const parsed = row.rawJson as unknown as ParsedRow
      if (!parsed.registrationType) { rowsSkipped++; continue }

      let inst: { id: string; name: string } | null = null
      if (parsed.institutionName) {
        const existing = await tx.tournamentInstitution.findFirst({
          where: { tournamentId: importRec.tournamentId, name: { equals: parsed.institutionName, mode: 'insensitive' } },
        })
        if (existing) {
          inst = existing
          if (phase === 'phase-1') {
            await tx.tournamentInstitution.update({
              where: { id: existing.id },
              data: {
                teamsIntended: parsed.teamsIntended ?? existing.teamsIntended,
                adjudicatorsIntended: parsed.adjudicatorsIntended ?? existing.adjudicatorsIntended,
                contactName: parsed.representative.name ?? existing.contactName,
                contactEmail: parsed.representative.email ?? existing.contactEmail,
                contactPhone: parsed.representative.phone ?? existing.contactPhone,
              },
            })
          }
        } else {
          inst = await tx.tournamentInstitution.create({
            data: {
              tournamentId: importRec.tournamentId,
              name: parsed.institutionName,
              teamsIntended: parsed.teamsIntended ?? undefined,
              adjudicatorsIntended: parsed.adjudicatorsIntended ?? undefined,
              contactName: parsed.representative.name ?? undefined,
              contactEmail: parsed.representative.email ?? undefined,
              contactPhone: parsed.representative.phone ?? undefined,
            },
            select: { id: true, name: true },
          })
          institutionsCreated++
          await tx.institutionPortalToken.create({
            data: { tournamentInstitutionId: inst.id, token: urlSafeToken(), active: true },
          })
        }
      }

      if (phase === 'phase-1') { rowsImported++; continue }

      if (inst && parsed.registrationType !== 'independent_adjudicator') {
        for (const team of parsed.logicalTeams) {
          if (!team.teamName) continue
          const beforeUpsert = await tx.team.findUnique({
            where: { tournamentInstitutionId_name: { tournamentInstitutionId: inst.id, name: team.teamName } },
          })
          const t = await tx.team.upsert({
            where: { tournamentInstitutionId_name: { tournamentInstitutionId: inst.id, name: team.teamName } },
            update: { isNovice: team.isNovice, importPhase: phase },
            create: {
              tournamentInstitutionId: inst.id, name: team.teamName,
              isNovice: team.isNovice, importPhase: phase,
            },
          })
          if (beforeUpsert) recordsUpdatedViaReimport++; else teamsCreated++
          for (const d of team.debaters) {
            if (!d.name) continue
            const existingByEmail = d.email ? await tx.participant.findFirst({
              where: { tournamentInstitutionId: inst.id, email: d.email },
            }) : null
            if (existingByEmail) {
              await tx.participant.update({
                where: { id: existingByEmail.id },
                data: { displayName: d.name, phone: d.phone ?? undefined, teamId: t.id, importPhase: phase },
              })
              recordsUpdatedViaReimport++
            } else {
              await tx.participant.create({
                data: {
                  tournamentInstitutionId: inst.id, teamId: t.id, displayName: d.name,
                  email: d.email ?? undefined, phone: d.phone ?? undefined,
                  eligibility: 'ELIGIBLE', importPhase: phase,
                },
              })
              participantsCreated++
            }
          }
        }
      }

      for (const j of parsed.judges) {
        if (!j.name) continue
        const existing = j.email ? await tx.adjudicator.findFirst({
          where: { tournamentId: importRec.tournamentId, email: j.email },
        }) : null
        if (existing) {
          await tx.adjudicator.update({
            where: { id: existing.id },
            data: { displayName: j.name, phone: j.phone ?? undefined, importPhase: phase },
          })
          recordsUpdatedViaReimport++
        } else {
          await tx.adjudicator.create({
            data: {
              tournamentId: importRec.tournamentId,
              tournamentInstitutionId: parsed.registrationType === 'independent_adjudicator' ? null : (inst?.id ?? null),
              displayName: j.name, email: j.email ?? undefined, phone: j.phone ?? undefined,
              status: 'ACTIVE', importPhase: phase,
            },
          })
          adjudicatorsCreated++
        }
      }

      rowsImported++
      await tx.csvImportRow.update({
        where: { id: row.id },
        data: { status: 'IMPORTED' },
      })
    }

    await tx.csvImport.update({
      where: { id: importId },
      data: {
        summaryJson: {
          institutionsCreated, teamsCreated, participantsCreated,
          adjudicatorsCreated, recordsUpdatedViaReimport, rowsImported, rowsSkipped,
        } as never,
      },
    })

    return { institutionsCreated, teamsCreated, participantsCreated, adjudicatorsCreated, recordsUpdatedViaReimport, rowsImported, rowsSkipped }
  })
}
