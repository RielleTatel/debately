import { describe, it, expect, vi, beforeEach } from 'vitest'

const getUser = vi.fn()
const findUnique = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser, signUp: vi.fn(), signInWithPassword: vi.fn(), signOut: vi.fn(), resetPasswordForEmail: vi.fn() },
  }),
}))
vi.mock('@/lib/prisma', () => ({ prisma: { profile: { findUnique } } }))

beforeEach(() => { getUser.mockReset(); findUnique.mockReset() })

describe('getCurrentUser', () => {
  it('returns null when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null })
    const { getCurrentUser } = await import('@/features/auth/queries/current-user')
    expect(await getCurrentUser()).toBeNull()
  })
  it('returns user + profile + isVerified', async () => {
    getUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'a@b.com', email_confirmed_at: '2026-07-19T00:00:00Z' } },
      error: null,
    })
    findUnique.mockResolvedValue({ id: 'p1', displayName: 'A', avatarUrl: null })
    const { getCurrentUser } = await import('@/features/auth/queries/current-user')
    const r = await getCurrentUser()
    expect(r?.isVerified).toBe(true)
    expect(r?.profile.displayName).toBe('A')
  })
})

describe('requireVerifiedUser', () => {
  it('throws EMAIL_NOT_VERIFIED when unverified', async () => {
    getUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'a@b.com', email_confirmed_at: null } },
      error: null,
    })
    findUnique.mockResolvedValue({ id: 'p1', displayName: 'A' })
    const { requireVerifiedUser } = await import('@/features/auth/queries/current-user')
    await expect(requireVerifiedUser()).rejects.toMatchObject({ code: 'EMAIL_NOT_VERIFIED' })
  })
})
