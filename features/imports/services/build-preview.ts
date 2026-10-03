import { readDiffDecision } from './review-decisions'
import { prisma } from '@/lib/prisma'
import { canonicalInstitutionName, matchInstitutionName } from './normalize-institution'
import { readBatches } from './read-batches'
import { readPage, type SearchParams } from '@/lib/pagination'
import type { CsvImportRow } from '@prisma/client'
import type { ParsedRow, NormalizationPrompt, TeamDiff } from '@/features/imports/types'

export type PreviewState = {
  rows: (CsvImportRow & { parsed: ParsedRow })[]
  normalizationPrompts: NormalizationPrompt[]
  teamDiffs: TeamDiff[]
  total: number
  errors: number
  warnings: number
  paging: ReturnType<typeof readPage>
}

export async function buildImportPreview(
  importId: string,
  params: SearchParams = {},
): Promise<PreviewState> {
  const importRec = await prisma.csvImport.findUnique({
    where: { id: importId },
    select: { tournamentId: true },
  })
  if (!importRec) throw new Error('import not found')
  const paging = readPage(params)
  const tournamentId = importRec.tournamentId
  const [rows, counts, institutions, aliases] = await Promise.all([
    readBatches((cursor, take) =>
      prisma.csvImportRow.findMany({
        where: { importId },
        orderBy: [{ rowIndex: 'asc' }, { id: 'asc' }],
        take,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      }),
    ),
    prisma.csvImportRow.groupBy({ by: ['status'], where: { importId }, _count: true }),
    readBatches((cursor, take) =>
      prisma.tournamentInstitution.findMany({
        where: { tournamentId },
        select: { id: true, name: true },
        orderBy: { id: 'asc' },
        take,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      }),
    ),
    readBatches((cursor, take) =>
      prisma.institutionAlias.findMany({
        where: { tournamentId },
        select: { id: true, alias: true, resolvedInstitutionId: true },
        orderBy: { id: 'asc' },
        take,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      }),
    ),
  ])
  const byName = new Map<string, (typeof institutions)[number]>()
  for (const institution of institutions)
    if (!byName.has(institution.name.toLowerCase()))
      byName.set(institution.name.toLowerCase(), institution)
  const byId = new Map(institutions.map((i) => [i.id, i]))
  const aliasMap = new Map(aliases.map((a) => [a.alias, a.resolvedInstitutionId]))
  const relevantIds = new Set<string>()
  for (const row of rows) {
    const parsed = row.rawJson as unknown as ParsedRow
    if (!parsed.institutionName) continue
    const alias = row.messages.includes('NORMALIZATION_DECISION:reject')
      ? undefined
      : aliasMap.get(canonicalInstitutionName(parsed.institutionName))
    const id = alias ?? byName.get(parsed.institutionName.toLowerCase())?.id
    if (id) relevantIds.add(id)
  }
  const [teams, participants] = relevantIds.size
    ? await Promise.all([
        readBatches((cursor, take) =>
          prisma.team.findMany({
            where: { tournamentInstitutionId: { in: [...relevantIds] } },
            select: { id: true, name: true, tournamentInstitutionId: true },
            orderBy: { id: 'asc' },
            take,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
          }),
        ),
        readBatches((cursor, take) =>
          prisma.participant.findMany({
            where: { tournamentInstitutionId: { in: [...relevantIds] } },
            select: {
              id: true,
              displayName: true,
              teamId: true,
              email: true,
              tournamentInstitutionId: true,
            },
            orderBy: [{ displayName: 'asc' }, { id: 'asc' }],
            take,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
          }),
        ),
      ])
    : [[], []]
  const teamMap = new Map<string, (typeof teams)[number]>()
  for (const team of teams) {
    const key = JSON.stringify([team.tournamentInstitutionId, team.name])
    if (!teamMap.has(key)) teamMap.set(key, team)
  }
  const speakers = new Map<string, typeof participants>()
  const participantEmails = new Map<string, (typeof participants)[number]>()
  for (const p of participants) {
    if (p.email) {
      const key = JSON.stringify([p.tournamentInstitutionId, p.email])
      if (!participantEmails.has(key)) participantEmails.set(key, p)
    }
    if (!p.teamId) continue
    const group = speakers.get(p.teamId) ?? []
    group.push(p)
    speakers.set(p.teamId, group)
  }
  const prompts: NormalizationPrompt[] = []
  const diffs: TeamDiff[] = []
  const seen = new Set<string>()
  for (const row of rows) {
    const parsed = row.rawJson as unknown as ParsedRow
    if (!parsed.institutionName) continue
    const name = parsed.institutionName
    const alias = row.messages.includes('NORMALIZATION_DECISION:reject')
      ? undefined
      : aliasMap.get(canonicalInstitutionName(name))
    if (
      !seen.has(name.toLowerCase()) &&
      !alias &&
      !row.messages.includes('NORMALIZATION_DECISION:reject')
    ) {
      const outcome = matchInstitutionName(name, institutions)
      if (outcome.kind === 'fuzzy')
        prompts.push({ rawName: name, ...outcome, firstSeenRowIndex: row.rowIndex })
    }
    seen.add(name.toLowerCase())
    const inst = alias ? byId.get(alias) : byName.get(name.toLowerCase())
    if (!inst) continue
    const marker = readDiffDecision(row.messages)
    for (const team of parsed.logicalTeams) {
      if (!team.teamName) continue
      const existing = teamMap.get(JSON.stringify([inst.id, team.teamName.trim()]))
      if (!existing) continue
      const existingParticipants = speakers.get(existing.id) ?? []
      diffs.push({
        rowIndex: row.rowIndex,
        teamName: team.teamName,
        institutionName: name,
        existingTeamId: existing.id,
        decision: marker ? (marker.mode === 'keep-existing' ? 'kept' : 'applied') : undefined,
        selectedFields: marker?.selectedFields,
        fields: team.debaters.map((d, index) => {
          const speaker = d.email
            ? participantEmails.get(JSON.stringify([inst.id, d.email]))
            : existingParticipants[index]
          return {
            name: `debater_${index + 1}_name`,
            existing: speaker?.displayName ?? null,
            incoming: d.name,
            changed: (speaker?.displayName ?? null) !== d.name,
          }
        }),
      })
    }
  }
  const cards = [
    ...prompts.map((prompt) => ({ prompt })),
    ...diffs.map((diff) => ({ diff })),
  ].slice(paging.skip, paging.skip + paging.pageSize)
  return {
    rows: rows.map((r) => ({ ...r, parsed: r.rawJson as unknown as ParsedRow })),
    normalizationPrompts: cards.flatMap((card) => ('prompt' in card ? [card.prompt] : [])),
    teamDiffs: cards.flatMap((card) => ('diff' in card ? [card.diff] : [])),
    total: prompts.length + diffs.length,
    errors: counts.find((row) => row.status === 'ERROR')?._count ?? 0,
    warnings: counts.find((row) => row.status === 'WARNING')?._count ?? 0,
    paging,
  }
}
