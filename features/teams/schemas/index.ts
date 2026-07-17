import { z } from 'zod'

export const createTeamSchema = z.object({
  name: z.string().min(1).max(80),
  tournamentId: z.string().cuid(),
  institutionId: z.string().cuid().optional(),
})
