import { describe, it, expect, vi, beforeEach } from 'vitest'
const requireOrgOwner = vi.fn(); const del = vi.fn()
vi.mock('@/lib/prisma', () => ({ prisma: { organization: { delete: del } } }))
vi.mock('@/features/organizations/permissions', () => ({ requireOrgOwner }))
vi.mock('next/navigation', () => ({ redirect: (u: string) => { throw new Error('REDIRECT:' + u) } }))
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))
beforeEach(() => { requireOrgOwner.mockReset(); del.mockReset() })

describe('deleteOrganizationAction', () => {
  it('rejects wrong confirmName', async () => {
    requireOrgOwner.mockResolvedValue({ me: {}, org: { id: 'o1', name: 'My Org', slug: 's' } })
    const { deleteOrganizationAction } = await import('@/features/organizations/actions/delete')
    const fd = new FormData(); fd.set('orgId', 'o1'); fd.set('confirmName', 'wrong')
    expect((await deleteOrganizationAction(fd)).ok).toBe(false)
  })
  it('deletes on match', async () => {
    requireOrgOwner.mockResolvedValue({ me: {}, org: { id: 'o1', name: 'My Org', slug: 's' } })
    del.mockResolvedValue({})
    const { deleteOrganizationAction } = await import('@/features/organizations/actions/delete')
    const fd = new FormData(); fd.set('orgId', 'o1'); fd.set('confirmName', 'My Org')
    await expect(deleteOrganizationAction(fd)).rejects.toThrow('REDIRECT:/organization')
    expect(del).toHaveBeenCalledOnce()
  })
})
