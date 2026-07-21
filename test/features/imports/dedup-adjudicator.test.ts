import { describe, it, expect, vi, beforeEach } from 'vitest'
import { matchAdjudicator } from '@/features/imports/services/dedup-adjudicator'

vi.mock('@/lib/prisma', () => ({ prisma: { adjudicator: { findFirst: vi.fn() } } }))
import { prisma } from '@/lib/prisma'

describe('matchAdjudicator', () => {
  beforeEach(() => vi.clearAllMocks())
  it('matches by email exact', async () => {
    (prisma.adjudicator.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'a_1' })
    const r = await matchAdjudicator('t_1', 'j@x.com')
    expect(r?.id).toBe('a_1')
  })
  it('returns null without an email', async () => {
    expect(await matchAdjudicator('t_1', null)).toBeNull()
  })
})
