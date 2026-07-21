import { z } from 'zod'

export const updateAdjudicatorSchema = z.object({
  adjudicatorId: z.string().min(1),
  displayName: z.string().trim().min(1).max(200).optional(),
  email: z.string().email().max(200).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  experienceLevel: z.string().trim().max(200).nullable().optional(),
  availabilityNotes: z.string().trim().max(1000).nullable().optional(),
})

export const updateDirectorNotesSchema = z.object({
  adjudicatorId: z.string().min(1),
  directorNotes: z.string().trim().max(2000).nullable(),
})

export type UpdateAdjudicatorInput = z.infer<typeof updateAdjudicatorSchema>
export type UpdateDirectorNotesInput = z.infer<typeof updateDirectorNotesSchema>
