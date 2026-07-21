import { prisma } from '@/lib/prisma'
import { normalizeInstitutionName } from './normalize-institution'
import { matchTeam } from './dedup-team'
import type { CsvImportRow } from '@prisma/client'
import type { ParsedRow, NormalizationPrompt, TeamDiff } from '@/features/imports/types'

export type PreviewState = {
  rows: (CsvImportRow & { parsed: ParsedRow })[]
  normalizationPrompts: NormalizationPrompt[]
  teamDiffs: TeamDiff[]
}

export async function buildImportPreview(importId: string): Promise<PreviewState> {
  const importRec = await prisma.csvImport.findUnique({ where: { id: importId } })
  if (!importRec) throw new Error('import not found')
  const rows = await prisma.csvImportRow.findMany({ where: { importId }, orderBy: { rowIndex: 'asc' } })

  const prompts: NormalizationPrompt[] = []
  const diffs: TeamDiff[] = []
  const seenPromptNames = new Set<string>()

  for (const row of rows) {
    const parsed = row.rawJson as unknown as ParsedRow
    if (!parsed?.institutionName) continue
    if (!seenPromptNames.has(parsed.institutionName.toLowerCase())) {
      const outcome = await normalizeInstitutionName(importRec.tournamentId, parsed.institutionName)
      if (outcome.kind === 'fuzzy') {
        prompts.push({
          rawName: parsed.institutionName,
          suggestedInstitutionId: outcome.suggestedInstitutionId,
          suggestedName: outcome.suggestedName,
          distance: outcome.distance,
          firstSeenRowIndex: row.rowIndex,
        })
      }
      seenPromptNames.add(parsed.institutionName.toLowerCase())
    }

    for (const team of parsed.logicalTeams) {
      if (!team.teamName) continue
      const inst = await prisma.tournamentInstitution.findFirst({
        where: { tournamentId: importRec.tournamentId, name: { equals: parsed.institutionName, mode: 'insensitive' } },
      })
      if (!inst) continue
      const existing = await matchTeam(inst.id, team.teamName)
      if (!existing) continue
      const existingParticipants = await prisma.participant.findMany({ where: { teamId: existing.id }, orderBy: { displayName: 'asc' } })
      const fields: TeamDiff['fields'] = []
      team.debaters.forEach((d, idx) => {
        const existingP = existingParticipants[idx]
        fields.push({
          name: `debater_${idx + 1}_name`,
          existing: existingP?.displayName ?? null,
          incoming: d.name,
          changed: (existingP?.displayName ?? null) !== d.name,
        })
      })
      diffs.push({
        teamName: team.teamName,
        institutionName: parsed.institutionName,
        existingTeamId: existing.id,
        fields,
      })
    }
  }

  return {
    rows: rows.map((r) => ({ ...r, parsed: r.rawJson as unknown as ParsedRow })),
    normalizationPrompts: prompts,
    teamDiffs: diffs,
  }
}
