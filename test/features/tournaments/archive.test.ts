import { describe, it, expect, vi, beforeEach } from 'vitest'

const update = vi.fn(async ({ data }: any) => ({ id: 't1', ...data }))
const requireDirector = vi.fn(async () => ({
  me: { profile: { id: 'p1' } },
  org: { id: 'o1', ownerId: 'p1' },
  tournament: { id: 't1', name: 'Champ 2026', status: 'ACTIVE' },
}))
const requireOwner = vi.fn(async () => ({
  me: { profile: { id: 'p1' } },
  org: { id: 'o1', ownerId: 'p1' },
}))
const findUnique = vi.fn(async () => ({ id: 't1', orgId: 'o1', status: 'ARCHIVED' }))

vi.mock('@/lib/prisma', () => ({
  prisma: { tournament: { update, findUnique } },
}))
vi.mock('@/features/tournaments/permissions', () => ({ requireTournamentDirector: requireDirector }))
vi.mock('@/features/organizations/permissions', () => ({ requireOrgOwner: requireOwner }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

beforeEach(() => { update.mockClear(); requireDirector.mockClear(); requireOwner.mockClear() })

describe('archiveTournamentAction', () => {
  it('rejects when confirmName does not match', async () => {
    const { archiveTournamentAction } = await import('@/features/tournaments/actions/archive')
    const fd = new FormData(); fd.set('tournamentId', 't1'); fd.set('confirmName', 'Wrong')
    const r = await archiveTournamentAction(fd)
    expect(r.ok).toBe(false)
  })
  it('archives when confirmName matches', async () => {
    const { archiveTournamentAction } = await import('@/features/tournaments/actions/archive')
    const fd = new FormData(); fd.set('tournamentId', 't1'); fd.set('confirmName', 'Champ 2026')
    const r = await archiveTournamentAction(fd)
    expect(r.ok).toBe(true)
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'ARCHIVED' }),
    }))
  })
})

describe('unarchiveTournamentAction', () => {
  it('unarchives to COMPLETED', async () => {
    const { unarchiveTournamentAction } = await import('@/features/tournaments/actions/archive')
    const fd = new FormData(); fd.set('tournamentId', 't1')
    const r = await unarchiveTournamentAction(fd)
    expect(r.ok).toBe(true)
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'COMPLETED', archivedAt: null }),
    }))
  })
})
