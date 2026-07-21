import { z } from 'zod'

export const updateTeamSchema = z.object({
  teamId: z.string().min(1),
  name: z.string().trim().min(1).max(120).optional(),
  isNovice: z.boolean().optional(),
})

export type UpdateTeamInput = z.infer<typeof updateTeamSchema>
