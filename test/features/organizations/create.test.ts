import { describe, it, expect, vi, beforeEach } from 'vitest'

const orgFindUnique = vi.fn(); const aliasFindUnique = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: (fn: any) => fn({
      organization: { create: vi.fn(async ({ data }) => ({ id: 'o1', ...data })) },
      organizationMember: { create: vi.fn(async ({ data }) => data) },
    }),
    organization: { findUnique: orgFindUnique },
    organizationSlugAlias: { findUnique: aliasFindUnique },
  },
}))
vi.mock('@/features/auth/queries', () => ({
  requireVerifiedUser: vi.fn(async () => ({ user: { id: 'u1', email: 'a@b.com' }, profile: { id: 'p1', displayName: 'A', avatarUrl: null }, isVerified: true })),
}))
vi.mock('next/navigation', () => ({ redirect: (u: string) => { throw new Error('REDIRECT:' + u) } }))

beforeEach(() => { orgFindUnique.mockReset(); aliasFindUnique.mockReset() })

describe('createOrganizationAction', () => {
  it('rejects reserved slug', async () => {
    const { createOrganizationAction } = await import('@/features/organizations/actions/create')
    const fd = new FormData(); fd.set('name', 'My'); fd.set('slug', 'admin')
    expect((await createOrganizationAction(fd)).ok).toBe(false)
  })
  it('rejects slug taken', async () => {
    orgFindUnique.mockResolvedValue({ id: 'x' })
    const { createOrganizationAction } = await import('@/features/organizations/actions/create')
    const fd = new FormData(); fd.set('name', 'My Org'); fd.set('slug', 'my-org')
    expect((await createOrganizationAction(fd)).ok).toBe(false)
  })
  it('creates + redirects', async () => {
    orgFindUnique.mockResolvedValue(null); aliasFindUnique.mockResolvedValue(null)
    const { createOrganizationAction } = await import('@/features/organizations/actions/create')
    const fd = new FormData(); fd.set('name', 'My Org'); fd.set('slug', 'my-org'); fd.set('description', '')
    await expect(createOrganizationAction(fd)).rejects.toThrow('REDIRECT:/organization/my-org')
  })
})
