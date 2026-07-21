import type { CsvImport, CsvImportRow, ColumnMapping } from '@prisma/client'

export type { CsvImport, CsvImportRow, ColumnMapping }

export type SystemField =
  | 'ignore'
  | 'registration_type'
  | 'institution_name'
  | 'representative_name'
  | 'representative_email'
  | 'representative_contact'
  | 'teams_intended'
  | 'adjudicators_intended'
  | 'team_name'
  | 'team_novice'
  | 'debater_name'
  | 'debater_email'
  | 'debater_contact'
  | 'debater_institution'
  | 'judge_name'
  | 'judge_email'
  | 'judge_contact'
  | 'judge_institution'

export type ColumnMappingEntry = {
  header: string
  field: SystemField
  slotIndex?: number
  repeatGroup?: string
}

export type MappingSpec = {
  entries: ColumnMappingEntry[]
  repeatGroups: { name: string; repetitions: number }[]
}

export type ParsedRow = {
  rowIndex: number
  raw: Record<string, string>
  logicalTeams: LogicalTeam[]
  registrationType: 'institution' | 'composite' | 'independent_adjudicator' | null
  institutionName: string | null
  representative: { name: string | null; email: string | null; phone: string | null }
  teamsIntended: number | null
  adjudicatorsIntended: number | null
  judges: LogicalJudge[]
}

export type LogicalTeam = {
  teamName: string | null
  isNovice: boolean
  debaters: LogicalDebater[]
  slotIndex: number
}

export type LogicalDebater = {
  name: string | null
  email: string | null
  phone: string | null
  institution: string | null
  slotIndex: number
}

export type LogicalJudge = {
  name: string | null
  email: string | null
  phone: string | null
  institution: string | null
}

export type RowIssue = { field: string; message: string; kind: 'error' | 'warning' }

export type NormalizationPrompt = {
  rawName: string
  suggestedInstitutionId: string
  suggestedName: string
  distance: number
  firstSeenRowIndex: number
}

export type TeamDiff = {
  teamName: string
  institutionName: string
  existingTeamId: string
  fields: { name: string; existing: string | null; incoming: string | null; changed: boolean }[]
}

export type ImportSummary = {
  rowsTotal: number
  rowsImported: number
  rowsWithErrors: number
  rowsWithWarnings: number
  rowsSkipped: number
  institutionsCreated: number
  teamsCreated: number
  participantsCreated: number
  adjudicatorsCreated: number
  recordsUpdatedViaReimport: number
  aliasesApplied: number
}
