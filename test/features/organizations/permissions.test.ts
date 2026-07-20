import { describe, it, expect, vi } from 'vitest'
vi.mock('@/lib/prisma', () => ({
  prisma: {
    organization: { findUnique: vi.fn(async ({ where }) => ({ id: where.id, ownerId: 'p1', slug: 's', name: 'n' })) },
    organizationMember: { findUnique: vi.fn() },
  },
}))
vi.mock('@/features/auth/queries', () => ({
  requireUser: vi.fn(async () => ({ user: { id: 'u1', email: 'a@b.com' }, profile: { id: 'p1', displayName: 'A', avatarUrl: null }, isVerified: true })),
}))

describe('requireOrgOwner', () => {
  it('resolves when OWNER', async () => {
    const { prisma } = await import('@/lib/prisma')
    ;(prisma.organizationMember.findUnique as any).mockResolvedValue({ role: 'OWNER' })
    const { requireOrgOwner } = await import('@/features/organizations/permissions')
    await expect(requireOrgOwner('o1')).resolves.toBeDefined()
  })
  it('rejects when MEMBER', async () => {
    const { prisma } = await import('@/lib/prisma')
    ;(prisma.organizationMember.findUnique as any).mockResolvedValue({ role: 'MEMBER' })
    const { requireOrgOwner } = await import('@/features/organizations/permissions')
    await expect(requireOrgOwner('o1')).rejects.toThrow()
  })
})
