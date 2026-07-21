import type {
  MappingSpec, ParsedRow, LogicalTeam, LogicalDebater, LogicalJudge,
} from '@/features/imports/types'

function truthy(v: string | undefined): boolean {
  if (!v) return false
  return ['yes', 'y', 'true', '1', 'novice'].includes(v.trim().toLowerCase())
}

function parseIntSafe(v: string | undefined): number | null {
  if (!v) return null
  const n = Number.parseInt(v.trim(), 10)
  return Number.isFinite(n) ? n : null
}

function routeType(v: string | undefined): ParsedRow['registrationType'] {
  if (!v) return null
  const norm = v.trim().toLowerCase()
  if (norm === 'institution') return 'institution'
  if (norm === 'composite') return 'composite'
  if (norm === 'independent adjudicator' || norm === 'independent_adjudicator') return 'independent_adjudicator'
  return null
}

export function applyMapping(
  raw: Record<string, string>,
  mapping: MappingSpec,
  rowIndex: number,
): ParsedRow {
  const nonRepeating = mapping.entries.filter((e) => !e.repeatGroup)
  const teamGroup = mapping.repeatGroups.find((g) => g.name === 'teams') ?? { name: 'teams', repetitions: 1 }
  const teamEntries = mapping.entries.filter((e) => e.repeatGroup === 'teams')

  const registrationType = routeType(pick(raw, nonRepeating, 'registration_type') ?? undefined)
  const institutionName = pick(raw, nonRepeating, 'institution_name')
  const representative = {
    name: pick(raw, nonRepeating, 'representative_name'),
    email: pick(raw, nonRepeating, 'representative_email'),
    phone: pick(raw, nonRepeating, 'representative_contact'),
  }
  const teamsIntended = parseIntSafe(pick(raw, nonRepeating, 'teams_intended') ?? undefined)
  const adjudicatorsIntended = parseIntSafe(pick(raw, nonRepeating, 'adjudicators_intended') ?? undefined)

  const logicalTeams: LogicalTeam[] = []
  const perRepetitionHeaders = distributeRepeatingHeaders(teamEntries, teamGroup.repetitions)

  for (let i = 0; i < teamGroup.repetitions; i++) {
    const slotEntries = perRepetitionHeaders[i] ?? []
    const teamName = getField(raw, slotEntries, 'team_name')
    const isNovice = truthy(getField(raw, slotEntries, 'team_novice') ?? undefined)
    const debaters: LogicalDebater[] = []
    for (const e of slotEntries.filter((x) => x.field === 'debater_name')) {
      const slot = e.slotIndex ?? 1
      const name = raw[e.header]
      if (!name) continue
      debaters.push({
        name: name || null,
        email: getSlot(raw, slotEntries, 'debater_email', slot),
        phone: getSlot(raw, slotEntries, 'debater_contact', slot),
        institution: getSlot(raw, slotEntries, 'debater_institution', slot),
        slotIndex: slot,
      })
    }
    if (!teamName && debaters.length === 0) continue
    logicalTeams.push({ teamName, isNovice, debaters, slotIndex: i + 1 })
  }

  const judges: LogicalJudge[] = []
  const judgeName = pick(raw, nonRepeating, 'judge_name')
  if (judgeName || registrationType === 'independent_adjudicator') {
    judges.push({
      name: judgeName,
      email: pick(raw, nonRepeating, 'judge_email'),
      phone: pick(raw, nonRepeating, 'judge_contact'),
      institution: pick(raw, nonRepeating, 'judge_institution'),
    })
  }

  return {
    rowIndex,
    raw,
    registrationType,
    institutionName,
    representative,
    teamsIntended,
    adjudicatorsIntended,
    logicalTeams,
    judges,
  }
}

function pick(raw: Record<string, string>, entries: MappingSpec['entries'], field: string): string | null {
  const e = entries.find((x) => x.field === field)
  if (!e) return null
  const v = raw[e.header]
  return v ? v.trim() || null : null
}

function distributeRepeatingHeaders(entries: MappingSpec['entries'], reps: number): MappingSpec['entries'][] {
  const out: MappingSpec['entries'][] = Array.from({ length: reps }, () => [])
  const seenPerField = new Map<string, number>()
  for (const e of entries) {
    const key = `${e.field}#${e.slotIndex ?? 0}`
    const count = seenPerField.get(key) ?? 0
    if (count < reps) out[count].push(e)
    seenPerField.set(key, count + 1)
  }
  return out
}

function getField(raw: Record<string, string>, entries: MappingSpec['entries'], field: string): string | null {
  return pick(raw, entries, field)
}

function getSlot(raw: Record<string, string>, entries: MappingSpec['entries'], field: string, slot: number): string | null {
  const e = entries.find((x) => x.field === field && (x.slotIndex ?? 0) === slot)
  if (!e) return null
  const v = raw[e.header]
  return v ? v.trim() || null : null
}
