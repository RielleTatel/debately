import { z } from 'zod'
import { DEBATE_FORMATS } from '@/lib/constants'

const tournamentBaseSchema = z.object({
  name: z.string().min(3).max(120),
  format: z.enum(DEBATE_FORMATS),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  maxTeams: z.coerce.number().int().positive().optional(),
  description: z.string().max(2000).optional(),
})

export const createTournamentSchema = tournamentBaseSchema.refine(
  (d) => d.endDate > d.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
)

export const updateTournamentSchema = tournamentBaseSchema.partial().extend({
  id: z.string().cuid(),
})
