import { describe, it, expect } from 'vitest'

describe('env', () => {
  it('parses required variables from process.env', async () => {
    const { env } = await import('@/lib/env')
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toMatch(/^http/)
    expect(env.RESEND_API_KEY).toBe('test-key')
  })
})
