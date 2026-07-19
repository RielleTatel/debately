import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const getUser = vi.fn()
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { getUser } }),
}))

beforeEach(() => { getUser.mockReset() })

function req(path: string) {
  return new NextRequest(new URL(`http://localhost${path}`))
}

describe('middleware', () => {
  it('redirects unauthenticated /dashboard to /login', async () => {
    getUser.mockResolvedValue({ data: { user: null } })
    const { middleware } = await import('@/middleware')
    const res = await middleware(req('/dashboard'))
    expect(res.headers.get('location')).toContain('/login')
  })
  it('lets authenticated user through /dashboard', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const { middleware } = await import('@/middleware')
    const res = await middleware(req('/dashboard'))
    expect(res.headers.get('location')).toBeNull()
  })
  it('redirects authenticated user from /login to /dashboard', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const { middleware } = await import('@/middleware')
    const res = await middleware(req('/login'))
    expect(res.headers.get('location')).toContain('/dashboard')
  })
})
