import { describe, it, expect, vi, beforeEach } from 'vitest'
const requireOrgOwner = vi.fn(); const targetFind = vi.fn(); const memberUpdate = vi.fn(); const orgUpdate = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: (fn: any) => fn({
      organizationMember: { update: memberUpdate }, organization: { update: orgUpdate },
    }),
    organizationMember: { findUnique: targetFind },
  },
}))
vi.mock('@/features/organizations/permissions', () => ({ requireOrgOwner }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
beforeEach(() => { requireOrgOwner.mockReset(); targetFind.mockReset(); memberUpdate.mockReset(); orgUpdate.mockReset() })

describe('transferOwnershipAction', () => {
  it('rejects non-member target', async () => {
    requireOrgOwner.mockResolvedValue({ me: { profile: { id: 'p1' } }, org: { id: 'o1', slug: 's', ownerId: 'p1' } })
    targetFind.mockResolvedValue(null)
    const { transferOwnershipAction } = await import('@/features/organizations/actions/transfer-ownership')
    const fd = new FormData(); fd.set('orgId', 'o1'); fd.set('toProfileId', 'p2')
    expect((await transferOwnershipAction(fd)).ok).toBe(false)
  })
  it('rejects self-transfer', async () => {
    requireOrgOwner.mockResolvedValue({ me: { profile: { id: 'p1' } }, org: { id: 'o1', slug: 's', ownerId: 'p1' } })
    const { transferOwnershipAction } = await import('@/features/organizations/actions/transfer-ownership')
    const fd = new FormData(); fd.set('orgId', 'o1'); fd.set('toProfileId', 'p1')
    expect((await transferOwnershipAction(fd)).ok).toBe(false)
  })
  it('swaps roles + updates ownerId atomically', async () => {
    requireOrgOwner.mockResolvedValue({ me: { profile: { id: 'p1' } }, org: { id: 'o1', slug: 's', ownerId: 'p1' } })
    targetFind.mockResolvedValue({ role: 'MEMBER', profileId: 'p2', orgId: 'o1' })
    memberUpdate.mockResolvedValue({}); orgUpdate.mockResolvedValue({})
    const { transferOwnershipAction } = await import('@/features/organizations/actions/transfer-ownership')
    const fd = new FormData(); fd.set('orgId', 'o1'); fd.set('toProfileId', 'p2')
    const r = await transferOwnershipAction(fd)
    expect(r.ok).toBe(true); expect(memberUpdate).toHaveBeenCalledTimes(2); expect(orgUpdate).toHaveBeenCalledOnce()
  })
})
