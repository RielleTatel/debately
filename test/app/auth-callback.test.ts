import { describe, it, expect, vi, beforeEach } from 'vitest'

const exchange = vi.fn()
const getUser = vi.fn()
const findUnique = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { exchangeCodeForSession: exchange, getUser, signUp: vi.fn(), signInWithPassword: vi.fn(), signOut: vi.fn() },
  }),
}))
vi.mock('@/lib/prisma', () => ({ prisma: { profile: { findUnique } } }))
vi.mock('@/services/email', () => ({ emailService: { sendWelcome: vi.fn() } }))

beforeEach(() => { exchange.mockReset(); getUser.mockReset(); findUnique.mockReset() })

describe('GET /auth/callback', () => {
  it('redirects to /login on missing code', async () => {
    const { GET } = await import('@/app/auth/callback/route')
    const req = new Request('http://x/auth/callback')
    const res = await GET(req as any)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/login')
  })
  it('exchanges code and redirects to next on success', async () => {
    exchange.mockResolvedValue({ error: null })
    getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.com', email_confirmed_at: 't' } }, error: null })
    findUnique.mockResolvedValue({ displayName: 'A' })
    const { GET } = await import('@/app/auth/callback/route')
    const req = new Request('http://x/auth/callback?code=abc&next=/dashboard')
    const res = await GET(req as any)
    expect(res.headers.get('location')).toContain('/dashboard')
  })
})
