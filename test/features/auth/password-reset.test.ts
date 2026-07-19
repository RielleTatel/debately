import { describe, it, expect, vi, beforeEach } from 'vitest'

const resetForEmail = vi.fn()
const updateUser = vi.fn()
const signOut = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      resetPasswordForEmail: resetForEmail,
      updateUser,
      signOut,
      signUp: vi.fn(), signInWithPassword: vi.fn(), getUser: vi.fn(),
    },
  }),
}))
vi.mock('@/services/email', () => ({ emailService: { sendPasswordReset: vi.fn() } }))
vi.mock('next/navigation', () => ({ redirect: (u: string) => { throw new Error('REDIRECT:' + u) } }))

beforeEach(async () => {
  resetForEmail.mockReset(); updateUser.mockReset(); signOut.mockReset()
  const { _resetRateLimit } = await import('@/lib/rate-limit')
  _resetRateLimit()
})

describe('forgotPasswordAction', () => {
  it('returns ok even on invalid email (no enumeration)', async () => {
    resetForEmail.mockResolvedValue({ error: { message: 'no user' } })
    const { forgotPasswordAction } = await import('@/features/auth/actions/forgot-password')
    const fd = new FormData(); fd.set('email', 'ghost@x.com')
    const r = await forgotPasswordAction(fd)
    expect(r.ok).toBe(true)
  })
  it('rate-limits per email', async () => {
    resetForEmail.mockResolvedValue({ error: null })
    const { forgotPasswordAction } = await import('@/features/auth/actions/forgot-password')
    for (let i = 0; i < 3; i++) {
      const fd = new FormData(); fd.set('email', 'a@b.com')
      await forgotPasswordAction(fd)
    }
    const fd = new FormData(); fd.set('email', 'a@b.com')
    const r = await forgotPasswordAction(fd)
    expect(r.ok).toBe(false)
  })
})

describe('resetPasswordAction', () => {
  it('updates password and revokes other sessions', async () => {
    updateUser.mockResolvedValue({ error: null })
    signOut.mockResolvedValue({ error: null })
    const { resetPasswordAction } = await import('@/features/auth/actions/reset-password')
    const fd = new FormData()
    fd.set('password', 'Valid1Password'); fd.set('confirmPassword', 'Valid1Password')
    await expect(resetPasswordAction(fd)).rejects.toThrow('REDIRECT:/login')
    expect(updateUser).toHaveBeenCalledWith({ password: 'Valid1Password' })
    expect(signOut).toHaveBeenCalledWith({ scope: 'others' })
  })
  it('rejects mismatched passwords', async () => {
    const { resetPasswordAction } = await import('@/features/auth/actions/reset-password')
    const fd = new FormData()
    fd.set('password', 'Valid1Password'); fd.set('confirmPassword', 'Nope1Password')
    const r = await resetPasswordAction(fd)
    expect(r.ok).toBe(false)
  })
})
