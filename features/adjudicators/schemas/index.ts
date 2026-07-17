import { z } from 'zod'

export const registerAdjudicatorSchema = z.object({
  userId: z.string().cuid(),
  tournamentId: z.string().cuid(),
  score: z.number().min(0).max(100).optional(),
})
