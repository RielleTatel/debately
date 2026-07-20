import { describe, it, expect, vi, beforeEach } from 'vitest'
const findUnique = vi.fn(); const update = vi.fn(); const memberCreate = vi.fn(); const requireVerifiedUser = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: (fn: any) => fn({
      organizationInvitation: { update },
      organizationMember: { create: memberCreate, findUnique: vi.fn().mockResolvedValue(null) },
    }),
    organizationInvitation: { findUnique },
  },
}))
vi.mock('@/features/auth/queries', () => ({ requireVerifiedUser }))
vi.mock('next/navigation', () => ({ redirect: (u: string) => { throw new Error('REDIRECT:' + u) } }))

beforeEach(() => { findUnique.mockReset(); update.mockReset(); memberCreate.mockReset(); requireVerifiedUser.mockReset() })

describe('acceptInvitationAction', () => {
  it('rejects unknown token', async () => {
    findUnique.mockResolvedValue(null)
    requireVerifiedUser.mockResolvedValue({ user: { email: 'a@b.com' }, profile: { id: 'p1' } })
    const { acceptInvitationAction } = await import('@/features/invitations/actions/accept')
    const fd = new FormData(); fd.set('token', 'x'.repeat(32))
    expect((await acceptInvitationAction(fd)).ok).toBe(false)
  })
  it('rejects expired', async () => {
    findUnique.mockResolvedValue({ id: 'i1', email: 'a@b.com', orgId: 'o1', role: 'MEMBER', expiresAt: new Date(Date.now() - 1000), acceptedAt: null, revokedAt: null, organization: { slug: 's' } })
    requireVerifiedUser.mockResolvedValue({ user: { email: 'a@b.com' }, profile: { id: 'p1' } })
    const { acceptInvitationAction } = await import('@/features/invitations/actions/accept')
    const fd = new FormData(); fd.set('token', 'x'.repeat(32))
    expect((await acceptInvitationAction(fd)).ok).toBe(false)
  })
  it('rejects email mismatch', async () => {
    findUnique.mockResolvedValue({ id: 'i1', email: 'a@b.com', orgId: 'o1', role: 'MEMBER', expiresAt: new Date(Date.now() + 100000), acceptedAt: null, revokedAt: null, organization: { slug: 's' } })
    requireVerifiedUser.mockResolvedValue({ user: { email: 'other@b.com' }, profile: { id: 'p1' } })
    const { acceptInvitationAction } = await import('@/features/invitations/actions/accept')
    const fd = new FormData(); fd.set('token', 'x'.repeat(32))
    expect((await acceptInvitationAction(fd)).ok).toBe(false)
  })
  it('creates membership and redirects', async () => {
    findUnique.mockResolvedValue({ id: 'i1', email: 'a@b.com', orgId: 'o1', role: 'MEMBER', expiresAt: new Date(Date.now() + 100000), acceptedAt: null, revokedAt: null, organization: { slug: 's' } })
    requireVerifiedUser.mockResolvedValue({ user: { email: 'a@b.com' }, profile: { id: 'p1' } })
    const { acceptInvitationAction } = await import('@/features/invitations/actions/accept')
    const fd = new FormData(); fd.set('token', 'x'.repeat(32))
    await expect(acceptInvitationAction(fd)).rejects.toThrow('REDIRECT:/organization/s')
    expect(memberCreate).toHaveBeenCalledOnce(); expect(update).toHaveBeenCalledOnce()
  })
})
