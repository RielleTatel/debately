import { z } from 'zod'

export const inviteMemberSchema = z.object({ email: z.string().email(), role: z.enum(['MEMBER']) })
export const acceptInvitationSchema = z.object({ token: z.string().min(16) })
export const revokeInvitationSchema = z.object({ invitationId: z.string().min(1) })

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>
export type RevokeInvitationInput = z.infer<typeof revokeInvitationSchema>
