import { describe, it, expect } from 'vitest'
import { inviteMemberSchema, acceptInvitationSchema, revokeInvitationSchema } from '@/features/invitations/schemas'

describe('inviteMemberSchema', () => {
  it('accepts', () => { expect(inviteMemberSchema.safeParse({ email: 'a@b.com', role: 'MEMBER' }).success).toBe(true) })
  it('rejects bad email', () => { expect(inviteMemberSchema.safeParse({ email: 'nope', role: 'MEMBER' }).success).toBe(false) })
  it('rejects bad role', () => { expect(inviteMemberSchema.safeParse({ email: 'a@b.com', role: 'ADMIN' }).success).toBe(false) })
})
describe('acceptInvitationSchema', () => { it('requires token', () => { expect(acceptInvitationSchema.safeParse({}).success).toBe(false) }) })
describe('revokeInvitationSchema', () => { it('requires id', () => { expect(revokeInvitationSchema.safeParse({}).success).toBe(false) }) })
