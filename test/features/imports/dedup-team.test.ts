import { describe, it, expect, vi, beforeEach } from 'vitest'
import { matchTeam } from '@/features/imports/services/dedup-team'

vi.mock('@/lib/prisma', () => ({ prisma: { team: { findUnique: vi.fn() } } }))
import { prisma } from '@/lib/prisma'

describe('matchTeam', () => {
  beforeEach(() => vi.clearAllMocks())
  it('returns null when no match', async () => {
    (prisma.team.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    expect(await matchTeam('ti_1', 'Alpha')).toBeNull()
  })
  it('returns team when found', async () => {
    (prisma.team.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 't_1', name: 'Alpha' })
    const r = await matchTeam('ti_1', '  alpha ')
    expect(r?.id).toBe('t_1')
  })
})
