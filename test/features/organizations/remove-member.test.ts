import { describe, it, expect, vi, beforeEach } from 'vitest'
const requireOrgOwner = vi.fn(); const findUnique = vi.fn(); const del = vi.fn()
vi.mock('@/lib/prisma', () => ({ prisma: { organizationMember: { findUnique, delete: del } } }))
vi.mock('@/features/organizations/permissions', () => ({ requireOrgOwner }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
beforeEach(() => { requireOrgOwner.mockReset(); findUnique.mockReset(); del.mockReset() })

describe('removeMemberAction', () => {
  it('rejects removing OWNER', async () => {
    requireOrgOwner.mockResolvedValue({ me: {}, org: { id: 'o1', slug: 's' } })
    findUnique.mockResolvedValue({ role: 'OWNER', profileId: 'p1', orgId: 'o1' })
    const { removeMemberAction } = await import('@/features/organizations/actions/remove-member')
    const fd = new FormData(); fd.set('orgId', 'o1'); fd.set('profileId', 'p1')
    expect((await removeMemberAction(fd)).ok).toBe(false)
  })
  it('removes MEMBER + reports TD warning stub false', async () => {
    requireOrgOwner.mockResolvedValue({ me: {}, org: { id: 'o1', slug: 's' } })
    findUnique.mockResolvedValue({ role: 'MEMBER', profileId: 'p2', orgId: 'o1' })
    del.mockResolvedValue({})
    const { removeMemberAction } = await import('@/features/organizations/actions/remove-member')
    const fd = new FormData(); fd.set('orgId', 'o1'); fd.set('profileId', 'p2')
    const r = await removeMemberAction(fd)
    expect(r.ok).toBe(true); if (r.ok) expect(r.data.warnedAboutTD).toBe(false)
  })
})
