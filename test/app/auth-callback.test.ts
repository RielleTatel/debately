import { describe, it, expect, vi, beforeEach } from 'vitest'

const exchange = vi.fn()
const getUser = vi.fn()
const findUnique = vi.fn()
const afterCallbacks: Array<() => Promise<void>> = []

vi.mock('next/server', async (original) => ({
  ...(await original<typeof import('next/server')>()),
  after: (callback: () => Promise<void>) => {
    afterCallbacks.push(callback)
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      exchangeCodeForSession: exchange,
      getUser,
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  }),
}))
vi.mock('@/lib/prisma', () => ({ prisma: { profile: { findUnique } } }))
vi.mock('@/services/email', () => ({ emailService: { sendWelcome: vi.fn() } }))

beforeEach(() => {
  exchange.mockReset()
  getUser.mockReset()
  findUnique.mockReset()
  afterCallbacks.length = 0
})

describe('GET /auth/callback', () => {
  it('redirects promptly while welcome-email preparation is slow', async () => {
    const user = { id: 'u1', email: 'a@b.com', email_confirmed_at: '2026-01-01' }
    exchange.mockResolvedValue({ data: { user }, error: null })
    getUser.mockResolvedValue({ data: { user }, error: null })
    findUnique.mockReturnValue(new Promise(() => undefined))
    const { GET } = await import('@/app/auth/callback/route')
    const result = await Promise.race([
      GET(new Request('http://x/auth/callback?code=abc')),
      new Promise<'delayed'>((resolve) => setTimeout(() => resolve('delayed'), 100)),
    ])
    expect(result).not.toBe('delayed')
  })
  it('redirects to /login on missing code', async () => {
    const { GET } = await import('@/app/auth/callback/route')
    const req = new Request('http://x/auth/callback')
    const res = await GET(req as any)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/login')
  })
  it('exchanges code and redirects to next on success', async () => {
    exchange.mockResolvedValue({ error: null })
    getUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'a@b.com', email_confirmed_at: 't' } },
      error: null,
    })
    findUnique.mockResolvedValue({ displayName: 'A' })
    const { GET } = await import('@/app/auth/callback/route')
    const req = new Request('http://x/auth/callback?code=abc&next=/dashboard')
    const res = await GET(req as any)
    expect(res.headers.get('location')).toContain('/dashboard')
  })
  it('sends the welcome message after the redirect using the verified exchange identity', async () => {
    exchange.mockResolvedValue({
      data: { user: { id: 'u1', email: 'a@b.com', email_confirmed_at: 't' } },
      error: null,
    })
    findUnique.mockResolvedValue({ displayName: 'A' })
    const { GET } = await import('@/app/auth/callback/route')
    const { emailService } = await import('@/services/email')
    const response = await GET(new Request('http://x/auth/callback?code=abc'))
    expect(response.headers.get('location')).toContain('/dashboard')
    await Promise.all(afterCallbacks.map((callback) => callback()))
    expect(emailService.sendWelcome).toHaveBeenCalledWith({ to: 'a@b.com', displayName: 'A' })
  })
})
