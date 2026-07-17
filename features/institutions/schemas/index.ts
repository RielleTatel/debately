import { z } from 'zod'

export const createInstitutionSchema = z.object({
  name: z.string().min(2).max(120),
  shortName: z.string().max(20).optional(),
  country: z.string().length(2).optional(),
})
