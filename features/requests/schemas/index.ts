import { z } from 'zod'

export const createRequestSchema = z.object({
  tournamentId: z.string().cuid(),
  requesterEmail: z.string().email(),
  type: z.enum(['team_registration', 'participant_registration', 'adjudicator_registration', 'custom']),
  notes: z.string().max(1000).optional(),
})
