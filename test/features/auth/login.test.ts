import { describe, it, expect, vi, beforeEach } from 'vitest'

const signIn = vi.fn()
const signOut = vi.fn().mockResolvedValue({ error: null })

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { signInWithPassword: signIn, signOut, signUp: vi.fn(), getUser: vi.fn(), resetPasswordForEmail: vi.fn() },
  }),
}))
vi.mock('next/navigation', () => ({ redirect: (u: string) => { throw new Error('REDIRECT:' + u) } }))

beforeEach(() => { signIn.mockReset() })

describe('loginAction', () => {
  it('redirects to /dashboard on success', async () => {
    signIn.mockResolvedValue({ data: { session: {} }, error: null })
    const { loginAction } = await import('@/features/auth/actions/login')
    const fd = new FormData(); fd.set('email', 'a@b.com'); fd.set('password', 'X')
    await expect(loginAction(fd)).rejects.toThrow('REDIRECT:/dashboard')
  })
  it('returns generic error on failure', async () => {
    signIn.mockResolvedValue({ data: null, error: { message: 'anything' } })
    const { loginAction } = await import('@/features/auth/actions/login')
    const fd = new FormData(); fd.set('email', 'a@b.com'); fd.set('password', 'X')
    const r = await loginAction(fd)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe('Invalid email or password')
  })
})

describe('logoutAction', () => {
  it('signs out then redirects', async () => {
    const { logoutAction } = await import('@/features/auth/actions/logout')
    await expect(logoutAction()).rejects.toThrow('REDIRECT:/login')
    expect(signOut).toHaveBeenCalled()
  })
})
