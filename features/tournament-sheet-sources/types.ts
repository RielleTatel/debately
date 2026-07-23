import type { RegistrationPhase } from '@prisma/client'

export type { RegistrationPhase }

export interface DetectedHeaders {
  headers: string[]
  sampleRowCount: number
}

export interface ColumnMapping {
  [canonicalField: string]: string
}

export const REGISTRATION_PHASES: RegistrationPhase[] = ['INSTITUTIONS', 'TEAMS', 'ADJUDICATORS']

export const PHASE_LABELS: Record<RegistrationPhase, string> = {
  INSTITUTIONS: 'Institutions',
  TEAMS: 'Teams',
  ADJUDICATORS: 'Adjudicators',
}
