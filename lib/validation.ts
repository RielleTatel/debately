import { z } from 'zod'

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number')

export const slugSchema = z
  .string()
  .min(3)
  .max(64)
  .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed')

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
})

export const dateRangeSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
}).refine((d) => d.to > d.from, { message: 'End date must be after start date' })
