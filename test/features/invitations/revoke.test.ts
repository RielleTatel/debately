import { describe, it, expect, vi, beforeEach } from 'vitest'
const findUnique = vi.fn(); const update = vi.fn(); const requireOrgOwner = vi.fn()
vi.mock('@/lib/prisma', () => ({ prisma: { organizationInvitation: { findUnique, update } } }))
vi.mock('@/features/organizations/permissions', () => ({ requireOrgOwner }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
beforeEach(() => { findUnique.mockReset(); update.mockReset(); requireOrgOwner.mockReset() })

describe('revokeInvitationAction', () => {
  it('rejects unknown', async () => {
    findUnique.mockResolvedValue(null)
    const { revokeInvitationAction } = await import('@/features/invitations/actions/revoke')
    const fd = new FormData(); fd.set('invitationId', 'i1')
    expect((await revokeInvitationAction(fd)).ok).toBe(false)
  })
  it('revokes when owner + pending', async () => {
    findUnique.mockResolvedValue({ id: 'i1', orgId: 'o1', acceptedAt: null, revokedAt: null })
    requireOrgOwner.mockResolvedValue({ me: {}, org: { id: 'o1', slug: 's' } })
    update.mockResolvedValue({})
    const { revokeInvitationAction } = await import('@/features/invitations/actions/revoke')
    const fd = new FormData(); fd.set('invitationId', 'i1')
    expect((await revokeInvitationAction(fd)).ok).toBe(true); expect(update).toHaveBeenCalledOnce()
  })
})
