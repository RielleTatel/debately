import { describe, it, expect, vi, beforeEach } from 'vitest'

const create = vi.fn(async ({ data }: any) => ({ id: 'e1', ...data }))
const update = vi.fn(async ({ data }: any) => ({ id: 'e1', ...data }))
const deleteFn = vi.fn(async () => ({ id: 'e1' }))
const findUnique = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    tournamentScheduleEntry: { create, update, delete: deleteFn, findUnique },
  },
}))
vi.mock('@/features/tournaments/permissions', () => ({
  requireTournamentDirector: vi.fn(async () => ({
    me: { profile: { id: 'p1' } }, org: { id: 'o1' },
    tournament: { id: 't1', status: 'DRAFT' },
  })),
  assertTournamentEditable: () => {},
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

beforeEach(() => {
  create.mockClear(); update.mockClear(); deleteFn.mockClear(); findUnique.mockReset()
})

const validFd = () => {
  const fd = new FormData()
  fd.set('tournamentId', 't1')
  fd.set('label', 'Round 1')
  fd.set('kind', 'ROUND')
  fd.set('startAt', '2026-08-01T09:00:00Z')
  fd.set('endAt', '2026-08-01T10:30:00Z')
  return fd
}

describe('createScheduleEntryAction', () => {
  it('rejects when endAt before startAt', async () => {
    const { createScheduleEntryAction } = await import('@/features/tournaments/actions/schedule')
    const fd = validFd(); fd.set('endAt', '2026-08-01T08:00:00Z')
    const r = await createScheduleEntryAction(fd)
    expect(r.ok).toBe(false)
  })
  it('creates when valid', async () => {
    const { createScheduleEntryAction } = await import('@/features/tournaments/actions/schedule')
    const r = await createScheduleEntryAction(validFd())
    expect(r.ok).toBe(true)
    expect(create).toHaveBeenCalledOnce()
  })
})

describe('updateScheduleEntryAction', () => {
  it('rejects when entry belongs to different tournament', async () => {
    findUnique.mockResolvedValue({ id: 'e1', tournamentId: 'other' })
    const { updateScheduleEntryAction } = await import('@/features/tournaments/actions/schedule')
    const fd = validFd(); fd.set('entryId', 'e1')
    const r = await updateScheduleEntryAction(fd)
    expect(r.ok).toBe(false)
  })
  it('updates when entry matches tournament', async () => {
    findUnique.mockResolvedValue({ id: 'e1', tournamentId: 't1' })
    const { updateScheduleEntryAction } = await import('@/features/tournaments/actions/schedule')
    const fd = validFd(); fd.set('entryId', 'e1')
    const r = await updateScheduleEntryAction(fd)
    expect(r.ok).toBe(true)
    expect(update).toHaveBeenCalledOnce()
  })
})

describe('deleteScheduleEntryAction', () => {
  it('deletes when entry belongs to tournament', async () => {
    findUnique.mockResolvedValue({ id: 'e1', tournamentId: 't1' })
    const { deleteScheduleEntryAction } = await import('@/features/tournaments/actions/schedule')
    const fd = new FormData(); fd.set('tournamentId', 't1'); fd.set('entryId', 'e1')
    const r = await deleteScheduleEntryAction(fd)
    expect(r.ok).toBe(true)
    expect(deleteFn).toHaveBeenCalledOnce()
  })
})
