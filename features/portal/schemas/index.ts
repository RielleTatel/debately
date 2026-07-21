import { z } from 'zod'

const email = z.string().email().max(200)
const phone = z.string().min(3).max(40)

export const claimTokenSchema = z.object({
  token: z.string().min(32).max(128),
})

export const regenerateTokenSchema = z.object({
  institutionId: z.string().min(1),
})

export const disableTokenSchema = z.object({
  institutionId: z.string().min(1),
  confirm: z.literal(true),
})

export const updateInstitutionProfileSchema = z.object({
  institutionId: z.string().min(1),
  contactName: z.string().trim().min(1).max(200).nullable().optional(),
  contactEmail: email.nullable().optional(),
  contactPhone: phone.nullable().optional(),
})

export type ClaimTokenInput = z.infer<typeof claimTokenSchema>
export type RegenerateTokenInput = z.infer<typeof regenerateTokenSchema>
export type DisableTokenInput = z.infer<typeof disableTokenSchema>
export type UpdateInstitutionProfileInput = z.infer<typeof updateInstitutionProfileSchema>
