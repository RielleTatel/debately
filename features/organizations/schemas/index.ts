import { z } from 'zod'
import { slugSchema } from '@/lib/validation'

export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(120),
  slug: slugSchema,
  website: z.string().url().optional().or(z.literal('')),
})
