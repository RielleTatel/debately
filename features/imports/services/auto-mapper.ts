import type { SystemField, ColumnMappingEntry } from '@/features/imports/types'

type Rule = { field: SystemField; patterns: RegExp[] }

const RULES: Rule[] = [
  { field: 'registration_type', patterns: [/registering as/i, /registration type/i, /register(ing)? type/i] },
  { field: 'institution_name', patterns: [/institution\s*name/i, /^institution\s*$/i, /school\s*name/i, /affiliation/i] },
  { field: 'teams_intended', patterns: [/number of teams/i, /teams intended/i, /how many teams/i, /^teams$/i] },
  { field: 'adjudicators_intended', patterns: [/number of (adjudicators|judges)/i, /(adjudicators|judges) intended/i, /how many (adjudicators|judges)/i] },
  { field: 'representative_name', patterns: [/name of.*representative/i, /representative\s*name/i, /contact person/i] },
  { field: 'representative_email', patterns: [/active email/i, /email address/i, /^email$/i, /rep(resentative)? email/i, /contact email/i] },
  { field: 'representative_contact', patterns: [/contact number/i, /phone\s*number/i, /mobile/i, /^phone$/i, /rep(resentative)? (contact|phone)/i] },
  { field: 'team_name', patterns: [/team name/i, /name of.*team/i, /^team$/i] },
  { field: 'team_novice', patterns: [/novice/i, /rookie/i] },
  { field: 'debater_name', patterns: [/debater\s*(name|full name)/i, /speaker\s*name/i, /name of.*(debater|speaker)/i] },
  { field: 'debater_email', patterns: [/debater\s*email/i, /speaker\s*email/i] },
  { field: 'debater_contact', patterns: [/debater\s*(contact|phone|number)/i, /speaker\s*(contact|phone|number)/i] },
  { field: 'debater_institution', patterns: [/debater\s*institution/i, /speaker\s*(institution|school)/i] },
  { field: 'judge_name', patterns: [/(judge|adjudicator|independent adjudicator)\s*(name|full name)/i, /name of.*(judge|adjudicator)/i] },
  { field: 'judge_email', patterns: [/(judge|adjudicator)\s*email/i] },
  { field: 'judge_contact', patterns: [/(judge|adjudicator)\s*(contact|phone|number)/i] },
  { field: 'judge_institution', patterns: [/(judge|adjudicator)\s*(institution|school)/i] },
]

export function autoMapHeaders(headers: string[]): ColumnMappingEntry[] {
  const usedNonRepeating = new Set<SystemField>()
  const NON_REPEATING: SystemField[] = [
    'registration_type', 'institution_name', 'teams_intended', 'adjudicators_intended',
    'representative_name', 'representative_email', 'representative_contact',
  ]

  return headers.map((h): ColumnMappingEntry => {
    const header = h.trim()
    if (!header) return { header: h, field: 'ignore' }

    for (const rule of RULES) {
      if (!rule.patterns.some((p) => p.test(header))) continue
      if (NON_REPEATING.includes(rule.field) && usedNonRepeating.has(rule.field)) continue
      if (NON_REPEATING.includes(rule.field)) usedNonRepeating.add(rule.field)
      return { header: h, field: rule.field }
    }
    return { header: h, field: 'ignore' }
  })
}
