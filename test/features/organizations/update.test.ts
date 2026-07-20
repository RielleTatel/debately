import { describe, it, expect, vi, beforeEach } from 'vitest'
const requireOrgOwner = vi.fn(); const orgFindUnique = vi.fn(); const aliasFindUnique = vi.fn()
const aliasUpsert = vi.fn(); const orgUpdate = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: (fn: any) => fn({
      organization: { update: orgUpdate },
      organizationSlugAlias: { upsert: aliasUpsert },
    }),
    organization: { findUnique: orgFindUnique },
    organizationSlugAlias: { findUnique: aliasFindUnique },
  },
}))
vi.mock('@/features/organizations/permissions', () => ({ requireOrgOwner }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/slug', () => ({ assertSlugAllowed: vi.fn() }))

beforeEach(() => { requireOrgOwner.mockReset(); orgFindUnique.mockReset(); aliasFindUnique.mockReset(); aliasUpsert.mockReset(); orgUpdate.mockReset() })

describe('updateOrganizationAction', () => {
  it('writes alias on slug change', async () => {
    requireOrgOwner.mockResolvedValue({ me: {}, org: { id: 'o1', slug: 'old', name: 'X' } })
    orgFindUnique.mockResolvedValue(null); aliasFindUnique.mockResolvedValue(null)
    orgUpdate.mockResolvedValue({ id: 'o1', slug: 'new' })
    const { updateOrganizationAction } = await import('@/features/organizations/actions/update')
    const fd = new FormData()
    fd.set('orgId', 'o1'); fd.set('name', 'Xx'); fd.set('slug', 'new'); fd.set('description', '')
    const r = await updateOrganizationAction(fd)
    expect(r.ok).toBe(true)
    expect(aliasUpsert).toHaveBeenCalledOnce()
    expect(aliasUpsert.mock.calls[0][0].where.oldSlug).toBe('old')
  })
  it('does not write alias when slug unchanged', async () => {
    requireOrgOwner.mockResolvedValue({ me: {}, org: { id: 'o1', slug: 'same', name: 'X' } })
    orgFindUnique.mockResolvedValue(null); aliasFindUnique.mockResolvedValue(null)
    orgUpdate.mockResolvedValue({ id: 'o1', slug: 'same' })
    const { updateOrganizationAction } = await import('@/features/organizations/actions/update')
    const fd = new FormData(); fd.set('orgId', 'o1'); fd.set('name', 'X'); fd.set('slug', 'same')
    await updateOrganizationAction(fd)
    expect(aliasUpsert).not.toHaveBeenCalled()
  })
  it('rejects slug conflict', async () => {
    requireOrgOwner.mockResolvedValue({ me: {}, org: { id: 'o1', slug: 'old' } })
    orgFindUnique.mockResolvedValue({ id: 'other' })
    const { updateOrganizationAction } = await import('@/features/organizations/actions/update')
    const fd = new FormData(); fd.set('orgId', 'o1'); fd.set('name', 'X'); fd.set('slug', 'taken')
    expect((await updateOrganizationAction(fd)).ok).toBe(false)
  })
})
