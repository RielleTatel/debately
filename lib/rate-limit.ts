type Entry = { count: number; resetAt: number }
const store = new Map<string, Entry>()

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true as const }
  }
  if (entry.count >= limit) {
    return { ok: false as const, retryAfterMs: entry.resetAt - now }
  }
  entry.count += 1
  return { ok: true as const }
}

export function _resetRateLimit() { store.clear() }
