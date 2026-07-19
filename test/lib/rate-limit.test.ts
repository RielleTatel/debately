import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { rateLimit } from '@/lib/rate-limit'

describe('rateLimit', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('allows up to the limit within the window', () => {
    for (let i = 0; i < 3; i++) {
      expect(rateLimit('k', 3, 60_000).ok).toBe(true)
    }
    expect(rateLimit('k', 3, 60_000).ok).toBe(false)
  })

  it('resets after the window elapses', () => {
    rateLimit('k2', 1, 1000)
    expect(rateLimit('k2', 1, 1000).ok).toBe(false)
    vi.advanceTimersByTime(1001)
    expect(rateLimit('k2', 1, 1000).ok).toBe(true)
  })

  it('reports retryAfterMs when denied', () => {
    rateLimit('k3', 1, 60_000)
    const r = rateLimit('k3', 1, 60_000)
    expect(r.ok).toBe(false)
    expect(r.retryAfterMs).toBeGreaterThan(0)
  })
})
