import type { Tournament } from '@/types/database'
import { TOURNAMENT_STATUS, DEBATE_FORMATS } from '@/lib/constants'

export type { Tournament }

export type TournamentStatus = (typeof TOURNAMENT_STATUS)[keyof typeof TOURNAMENT_STATUS]

export type DebateFormat = (typeof DEBATE_FORMATS)[number]

export type CreateTournamentInput = {
  name: string
  format: DebateFormat
  startDate: Date
  endDate: Date
  organizationId: string
  maxTeams?: number
  description?: string
}

export type UpdateTournamentInput = Partial<CreateTournamentInput> & { id: string }

export type TournamentWithCounts = Tournament & {
  _count: {
    teams: number
    participants: number
    adjudicators: number
  }
}
