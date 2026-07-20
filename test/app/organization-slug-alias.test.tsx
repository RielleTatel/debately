import { describe, it, expect, vi } from 'vitest'
const resolveOrgBySlug = vi.fn(); const requireOrgMember = vi.fn()
vi.mock('@/features/organizations/queries', () => ({ resolveOrgBySlug }))
vi.mock('@/features/organizations/permissions', () => ({ requireOrgMember }))
vi.mock('next/navigation', () => ({
  redirect: (u: string) => { throw new Error('REDIRECT:' + u) },
  notFound: () => { throw new Error('NOT_FOUND') },
}))

describe('org slug alias resolution (layout)', () => {
  it('redirects on alias', async () => {
    resolveOrgBySlug.mockResolvedValue({ org: null, redirectTo: '/organization/new-slug' })
    const layoutMod = await import('@/app/(dashboard)/organization/[slug]/layout')
    await expect(layoutMod.default({ children: null, params: Promise.resolve({ slug: 'old' }) } as any)).rejects.toThrow('REDIRECT:/organization/new-slug')
  })
  it('404s on unknown slug', async () => {
    resolveOrgBySlug.mockResolvedValue({ org: null, redirectTo: null })
    const layoutMod = await import('@/app/(dashboard)/organization/[slug]/layout')
    await expect(layoutMod.default({ children: null, params: Promise.resolve({ slug: 'nope' }) } as any)).rejects.toThrow('NOT_FOUND')
  })
})
