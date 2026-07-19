import { describe, it, expect, vi, beforeEach } from 'vitest'

const getUser = vi.fn()
const resend = vi.fn().mockResolvedValue({ error: null })

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser, resend, signUp: vi.fn(), signInWithPassword: vi.fn(), signOut: vi.fn(), resetPasswordForEmail: vi.fn() },
  }),
}))

beforeEach(async () => {
  getUser.mockReset(); resend.mockClear()
  const { _resetRateLimit } = await import('@/lib/rate-limit')
  _resetRateLimit()
})

describe('resendVerificationAction', () => {
  it('rejects when no user', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null })
    const { resendVerificationAction } = await import('@/features/auth/actions/resend-verification')
    const r = await resendVerificationAction()
    expect(r.ok).toBe(false)
  })
  it('resends once per minute per email', async () => {
    getUser.mockResolvedValue({ data: { user: { email: 'a@b.com' } }, error: null })
    const { resendVerificationAction } = await import('@/features/auth/actions/resend-verification')
    const r1 = await resendVerificationAction()
    const r2 = await resendVerificationAction()
    expect(r1.ok).toBe(true)
    expect(r2.ok).toBe(false)
  })
})
