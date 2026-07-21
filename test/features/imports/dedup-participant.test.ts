import { describe, it, expect, vi, beforeEach } from 'vitest'
import { matchParticipant } from '@/features/imports/services/dedup-participant'

vi.mock('@/lib/prisma', () => ({
  prisma: { participant: { findFirst: vi.fn(), findMany: vi.fn() } },
}))
import { prisma } from '@/lib/prisma'

describe('matchParticipant', () => {
  beforeEach(() => vi.clearAllMocks())
  it('matches by exact email first', async () => {
    (prisma.participant.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'p_1', email: 'x@y.com' })
    ;(prisma.participant.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([])
    const r = await matchParticipant('ti_1', 'Alice', 'x@y.com')
    expect(r?.match?.id).toBe('p_1')
    expect(r?.reason).toBe('email')
  })
  it('falls back to fuzzy name within institution', async () => {
    (prisma.participant.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    ;(prisma.participant.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'p_2', displayName: 'Alice Wonderland' },
    ])
    const r = await matchParticipant('ti_1', 'Allice Wonderland', null)
    expect(r?.match?.id).toBe('p_2')
    expect(r?.reason).toBe('fuzzy')
  })
  it('returns null with no matches', async () => {
    (prisma.participant.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    ;(prisma.participant.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: 'p_3', displayName: 'Bob' }])
    expect(await matchParticipant('ti_1', 'Charlie', null)).toBeNull()
  })
})
