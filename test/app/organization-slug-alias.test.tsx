import { describe, it, expect, vi } from 'vitest'
const resolveOrgAndRequireMembership = vi.fn()
vi.mock('@/features/organizations/queries', () => ({ resolveOrgAndRequireMembership }))
vi.mock('next/navigation', () => ({
  redirect: (u: string) => { throw new Error('REDIRECT:' + u) },
  notFound: () => { throw new Error('NOT_FOUND') },
}))

describe('org slug alias resolution (layout)', () => {
  it('redirects on alias', async () => {
    resolveOrgAndRequireMembership.mockResolvedValue({ org: null, role: null, redirectTo: '/organization/new-slug' })
    const layoutMod = await import('@/app/(dashboard)/organization/[slug]/layout')
    await expect(layoutMod.default({ children: null, params: Promise.resolve({ slug: 'old' }) } as any)).rejects.toThrow('REDIRECT:/organization/new-slug')
  })
  it('404s on unknown slug', async () => {
    resolveOrgAndRequireMembership.mockResolvedValue({ org: null, role: null, redirectTo: null })
    const layoutMod = await import('@/app/(dashboard)/organization/[slug]/layout')
    await expect(layoutMod.default({ children: null, params: Promise.resolve({ slug: 'nope' }) } as any)).rejects.toThrow('NOT_FOUND')
  })
})
