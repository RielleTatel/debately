import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getExpectationsSummary } from '@/features/imports/queries/expectations'

vi.mock('@/lib/prisma', () => ({
  prisma: { tournamentInstitution: { findMany: vi.fn() } },
}))
import { prisma } from '@/lib/prisma'

describe('getExpectationsSummary', () => {
  beforeEach(() => vi.clearAllMocks())
  it('flags a short institution', async () => {
    (prisma.tournamentInstitution.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'i1', name: 'A', teamsIntended: 4, adjudicatorsIntended: 2, _count: { teams: 3, adjudicators: 2 } },
    ])
    const rows = await getExpectationsSummary('t1')
    expect(rows[0].status).toBe('short')
    expect(rows[0].statusNote).toContain('1 team short')
  })
  it('flags an over institution', async () => {
    (prisma.tournamentInstitution.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'i1', name: 'A', teamsIntended: 3, adjudicatorsIntended: 0, _count: { teams: 4, adjudicators: 0 } },
    ])
    const rows = await getExpectationsSummary('t1')
    expect(rows[0].status).toBe('over')
  })
  it('returns "unknown" when no intent captured', async () => {
    (prisma.tournamentInstitution.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'i1', name: 'A', teamsIntended: null, adjudicatorsIntended: null, _count: { teams: 2, adjudicators: 1 } },
    ])
    const rows = await getExpectationsSummary('t1')
    expect(rows[0].status).toBe('unknown')
  })
})
