import { z } from 'zod'

export const createAnnouncementSchema = z.object({
  tournamentId: z.string().cuid(),
  title: z.string().min(3).max(200),
  body: z.string().min(1),
  publishedAt: z.coerce.date().optional(),
})
