import type { Team } from '@/types/database'

export type { Team }

export type CreateTeamInput = {
  name: string
  tournamentId: string
  institutionId?: string
}
