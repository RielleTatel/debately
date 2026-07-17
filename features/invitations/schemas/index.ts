import { z } from 'zod'

export const createInvitationSchema = z.object({
  email: z.string().email(),
  role: z.string().min(1),
  tournamentId: z.string().cuid().optional(),
})

export const acceptInvitationSchema = z.object({
  token: z.string().min(1),
})
