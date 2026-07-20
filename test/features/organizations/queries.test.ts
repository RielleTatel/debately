import { describe, it, expect, vi, beforeEach } from 'vitest'

const findMany = vi.fn(); const findUnique = vi.fn(); const aliasFindUnique = vi.fn(); const memberFindUnique = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    organization: { findMany, findUnique },
    organizationSlugAlias: { findUnique: aliasFindUnique },
    organizationMember: { findUnique: memberFindUnique, findMany: vi.fn() },
    organizationInvitation: { findMany: vi.fn() },
  },
}))
vi.mock('@/features/auth/queries', () => ({
  requireUser: vi.fn(async () => ({ user: { id: 'u1', email: 'a@b.com' }, profile: { id: 'p1', displayName: 'A', avatarUrl: null }, isVerified: true })),
  requireVerifiedUser: vi.fn(async () => ({ user: { id: 'u1', email: 'a@b.com' }, profile: { id: 'p1', displayName: 'A', avatarUrl: null }, isVerified: true })),
}))
beforeEach(() => { findMany.mockReset(); findUnique.mockReset(); aliasFindUnique.mockReset(); memberFindUnique.mockReset() })

describe('resolveOrgBySlug', () => {
  it('returns org when slug is current', async () => {
    findUnique.mockResolvedValue({ id: 'o1', slug: 'x' })
    const { resolveOrgBySlug } = await import('@/features/organizations/queries')
    const r = await resolveOrgBySlug('x'); expect(r.org?.id).toBe('o1'); expect(r.redirectTo).toBeNull()
  })
  it('returns redirectTo on unexpired alias', async () => {
    findUnique.mockResolvedValueOnce(null)
    aliasFindUnique.mockResolvedValue({ oldSlug: 'old', orgId: 'o1', expiresAt: new Date(Date.now() + 86400000), organization: { slug: 'new' } })
    const { resolveOrgBySlug } = await import('@/features/organizations/queries')
    expect((await resolveOrgBySlug('old')).redirectTo).toBe('/organization/new')
  })
  it('null when alias expired', async () => {
    findUnique.mockResolvedValueOnce(null)
    aliasFindUnique.mockResolvedValue({ expiresAt: new Date(Date.now() - 1000), organization: { slug: 'new' } })
    const { resolveOrgBySlug } = await import('@/features/organizations/queries')
    const r = await resolveOrgBySlug('old'); expect(r.org).toBeNull(); expect(r.redirectTo).toBeNull()
  })
})

describe('getUserRoleInOrg', () => {
  it('returns role', async () => {
    memberFindUnique.mockResolvedValue({ role: 'OWNER' })
    const { getUserRoleInOrg } = await import('@/features/organizations/queries')
    expect(await getUserRoleInOrg('p1', 'o1')).toBe('OWNER')
  })
  it('null if not member', async () => {
    memberFindUnique.mockResolvedValue(null)
    const { getUserRoleInOrg } = await import('@/features/organizations/queries')
    expect(await getUserRoleInOrg('p1', 'o1')).toBeNull()
  })
})
