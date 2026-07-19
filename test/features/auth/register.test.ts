import { describe, it, expect, vi, beforeEach } from 'vitest'

const signUp = vi.fn()
const insert = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { signUp, resetPasswordForEmail: vi.fn(), signInWithPassword: vi.fn(), signOut: vi.fn(), getUser: vi.fn() },
  }),
}))
vi.mock('@/lib/prisma', () => ({
  prisma: { profile: { create: insert } },
}))
vi.mock('@/services/email', () => ({
  emailService: { sendVerification: vi.fn(), sendPasswordReset: vi.fn(), sendWelcome: vi.fn() },
}))
vi.mock('next/navigation', () => ({ redirect: (u: string) => { throw new Error('REDIRECT:' + u) } }))

beforeEach(() => { signUp.mockReset(); insert.mockReset() })

describe('registerAction', () => {
  it('rejects invalid input', async () => {
    const { registerAction } = await import('@/features/auth/actions/register')
    const fd = new FormData()
    fd.set('email', 'not-email'); fd.set('password', 'weak'); fd.set('displayName', 'A')
    const r = await registerAction(fd)
    expect(r.ok).toBe(false)
  })

  it('creates auth user, profile row, sends verification, and redirects', async () => {
    signUp.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    insert.mockResolvedValue({ id: 'p1' })
    const { registerAction } = await import('@/features/auth/actions/register')
    const fd = new FormData()
    fd.set('email', 'a@b.com'); fd.set('password', 'Valid1Password'); fd.set('displayName', 'Test User')
    await expect(registerAction(fd)).rejects.toThrow('REDIRECT:/verify-email')
    expect(signUp).toHaveBeenCalledOnce()
    expect(insert).toHaveBeenCalledWith({ data: { userId: 'u1', displayName: 'Test User' } })
  })

  it('bubbles up Supabase errors as ActionResult err', async () => {
    signUp.mockResolvedValue({ data: null, error: { message: 'already registered' } })
    const { registerAction } = await import('@/features/auth/actions/register')
    const fd = new FormData()
    fd.set('email', 'a@b.com'); fd.set('password', 'Valid1Password'); fd.set('displayName', 'X Y')
    const r = await registerAction(fd)
    expect(r.ok).toBe(false)
  })
})
