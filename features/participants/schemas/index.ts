import { z } from 'zod'

const email = z.string().email().max(200)

export const updateParticipantSchema = z.object({
  participantId: z.string().min(1),
  displayName: z.string().trim().min(1).max(200).optional(),
  email: email.nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
})

export const setEligibilitySchema = z.object({
  participantId: z.string().min(1),
  eligibility: z.enum(['ELIGIBLE', 'INELIGIBLE']),
  reason: z.string().trim().min(1).max(500).optional(),
}).refine(
  (v) => v.eligibility !== 'INELIGIBLE' || (v.reason && v.reason.length > 0),
  { message: 'A reason is required when flagging as ineligible', path: ['reason'] }
)

export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>
export type SetEligibilityInput = z.infer<typeof setEligibilitySchema>
