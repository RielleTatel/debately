import { describe, it, expect } from 'vitest'
import { generateInviteToken } from '@/features/invitations/services/token'
describe('generateInviteToken', () => {
  it('url-safe', () => { expect(generateInviteToken()).toMatch(/^[A-Za-z0-9_-]+$/) })
  it('>= 32 chars', () => { expect(generateInviteToken().length).toBeGreaterThanOrEqual(32) })
  it('unique across 100', () => { expect(new Set(Array.from({length: 100}, generateInviteToken)).size).toBe(100) })
})
