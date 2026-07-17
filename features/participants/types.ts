import type { Participant } from '@/types/database'

export type { Participant }

export type RegisterParticipantInput = {
  userId: string
  tournamentId: string
  teamId?: string
  institutionId?: string
  role?: 'speaker' | 'swing'
}
