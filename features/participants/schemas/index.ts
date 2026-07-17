import { z } from 'zod'

export const registerParticipantSchema = z.object({
  userId: z.string().cuid(),
  tournamentId: z.string().cuid(),
  teamId: z.string().cuid().optional(),
  institutionId: z.string().cuid().optional(),
  role: z.enum(['speaker', 'swing']).default('speaker'),
})
