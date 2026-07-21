import { z } from 'zod'
import type { RequestType } from '@prisma/client'

const teamAdditionPayload = z.object({
  teamName: z.string().min(1).max(120),
  speakers: z.array(z.object({ firstName: z.string().min(1).max(60), lastName: z.string().min(1).max(60), email: z.string().email() })).min(1).max(4),
})
const teamWithdrawalPayload = z.object({ teamId: z.string().min(1), reason: z.string().min(3).max(500) })
const speakerReplacementPayload = z.object({ teamId: z.string().min(1), outgoingParticipantId: z.string().min(1), incoming: z.object({ firstName: z.string().min(1).max(60), lastName: z.string().min(1).max(60), email: z.string().email() }) })
const adjudicatorAddPayload = z.object({ firstName: z.string().min(1).max(60), lastName: z.string().min(1).max(60), email: z.string().email(), experience: z.string().max(1000).optional() })
const adjudicatorRemovePayload = z.object({ adjudicatorId: z.string().min(1), reason: z.string().min(3).max(500) })
const institutionInfoUpdatePayload = z.object({ field: z.enum(['name', 'contactEmail', 'contactPhone', 'billingAddress']), newValue: z.string().min(1).max(500) })
const billingQuestionPayload = z.object({ invoiceNumber: z.string().min(1).max(60), question: z.string().min(5).max(2000) })
const deadlineExtensionPayload = z.object({ deadlineKind: z.enum(['registration', 'payment']), requestedDate: z.coerce.date(), reason: z.string().min(5).max(2000) })
const accessibilityAccommodationPayload = z.object({ affectedProfileIds: z.array(z.string()).min(1), needs: z.string().min(5).max(2000) })
const dietaryAccommodationPayload = z.object({ affectedProfileIds: z.array(z.string()).min(1), restrictions: z.string().min(3).max(2000) })
const equipmentRequestPayload = z.object({ items: z.array(z.object({ label: z.string().min(1), quantity: z.number().int().min(1).max(1000) })).min(1), reason: z.string().min(3).max(1000) })
const rulesClarificationPayload = z.object({ sectionReference: z.string().max(200), question: z.string().min(5).max(2000) })
const otherPayload = z.object({ freeform: z.string().min(3).max(4000) })

type Entry = { label: string; payloadSchema: z.ZodTypeAny; postDeadlineAllowed: boolean }

export const REQUEST_REGISTRY: Record<RequestType, Entry> = {
  TEAM_ADDITION: { label: 'Team addition', payloadSchema: teamAdditionPayload, postDeadlineAllowed: false },
  TEAM_WITHDRAWAL: { label: 'Team withdrawal', payloadSchema: teamWithdrawalPayload, postDeadlineAllowed: false },
  SPEAKER_REPLACEMENT: { label: 'Speaker replacement', payloadSchema: speakerReplacementPayload, postDeadlineAllowed: true },
  ADJUDICATOR_ADD: { label: 'Adjudicator add', payloadSchema: adjudicatorAddPayload, postDeadlineAllowed: true },
  ADJUDICATOR_REMOVE: { label: 'Adjudicator remove', payloadSchema: adjudicatorRemovePayload, postDeadlineAllowed: true },
  INSTITUTION_INFO_UPDATE: { label: 'Institution info', payloadSchema: institutionInfoUpdatePayload, postDeadlineAllowed: true },
  BILLING_QUESTION: { label: 'Billing question', payloadSchema: billingQuestionPayload, postDeadlineAllowed: true },
  DEADLINE_EXTENSION: { label: 'Deadline extension', payloadSchema: deadlineExtensionPayload, postDeadlineAllowed: true },
  ACCESSIBILITY_ACCOMMODATION: { label: 'Accessibility accommodation', payloadSchema: accessibilityAccommodationPayload, postDeadlineAllowed: true },
  DIETARY_ACCOMMODATION: { label: 'Dietary accommodation', payloadSchema: dietaryAccommodationPayload, postDeadlineAllowed: true },
  EQUIPMENT_REQUEST: { label: 'Equipment request', payloadSchema: equipmentRequestPayload, postDeadlineAllowed: true },
  RULES_CLARIFICATION: { label: 'Rules clarification', payloadSchema: rulesClarificationPayload, postDeadlineAllowed: true },
  OTHER: { label: 'Other', payloadSchema: otherPayload, postDeadlineAllowed: true },
}
