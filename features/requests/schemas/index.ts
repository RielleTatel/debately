import { z } from 'zod'

export const REQUEST_TYPES = ['TEAM_ADDITION', 'TEAM_WITHDRAWAL', 'SPEAKER_REPLACEMENT', 'ADJUDICATOR_ADD', 'ADJUDICATOR_REMOVE', 'INSTITUTION_INFO_UPDATE', 'BILLING_QUESTION', 'DEADLINE_EXTENSION', 'ACCESSIBILITY_ACCOMMODATION', 'DIETARY_ACCOMMODATION', 'EQUIPMENT_REQUEST', 'RULES_CLARIFICATION', 'OTHER'] as const
export const RequestTypeEnum = z.enum(REQUEST_TYPES)

export const submitRequestSchema = z.object({
  tournamentInstitutionId: z.string().min(1),
  type: RequestTypeEnum,
  description: z.string().min(3).max(2000),
  payloadRaw: z.string(),
})
export type SubmitRequestInput = z.infer<typeof submitRequestSchema>

export const requestActionSchema = z.object({ requestId: z.string().min(1) })

export const rejectRequestSchema = requestActionSchema.extend({ reason: z.string().min(5).max(2000) })
export const moreInfoSchema = requestActionSchema.extend({ note: z.string().min(3).max(2000) })
export const provideInfoSchema = requestActionSchema.extend({ note: z.string().min(3).max(2000) })
