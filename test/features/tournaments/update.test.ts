import { describe, it, expect, vi, beforeEach } from 'vitest'

const tournamentUpdate = vi.fn(async ({ data }: any) => ({ id: 't1', ...data }))
const tournamentFindFirst = vi.fn()
const requireDirector = vi.fn(async () => ({
  me: { profile: { id: 'p1' } },
  org: { id: 'o1', slug: 'my-org' },
  tournament: {
    id: 't1', orgId: 'o1', slug: 'champ-2026', status: 'DRAFT',
    name: 'Champ', registrationDeadline: new Date('2026-07-25'),
    paymentDeadline: null, feeStructure: { kind: 'none', lines: [] }, currency: 'USD',
    startDate: new Date('2026-08-01'), endDate: new Date('2026-08-03'),
  },
}))
const notifySensitive = vi.fn(async () => undefined)

vi.mock('@/lib/prisma', () => ({
  prisma: { tournament: { update: tournamentUpdate, findFirst: tournamentFindFirst } },
}))
vi.mock('@/features/tournaments/permissions', () => ({
  requireTournamentDirector: requireDirector,
  assertTournamentEditable: (t: any) => {
    if (t.status === 'COMPLETED' || t.status === 'ARCHIVED') throw new Error('CONFLICT')
  },
}))
vi.mock('@/features/tournaments/services', () => ({ notifyIfSensitiveChanged: notifySensitive }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

beforeEach(() => {
  tournamentUpdate.mockClear(); tournamentFindFirst.mockReset(); notifySensitive.mockClear()
  requireDirector.mockClear()
})

describe('updateFinanceSettingsAction', () => {
  it('fires sensitive notification', async () => {
    const { updateFinanceSettingsAction } = await import('@/features/tournaments/actions/update')
    const fd = new FormData()
    fd.set('tournamentId', 't1')
    fd.set('currency', 'PHP')
    fd.set('feeStructure', JSON.stringify({ kind: 'itemized', lines: [{ label: 'Team', amount: 1500, unit: 'per_team' }] }))
    fd.set('paymentDeadline', '2026-07-28T00:00:00Z')
    const r = await updateFinanceSettingsAction(fd)
    expect(r.ok).toBe(true)
    expect(notifySensitive).toHaveBeenCalledOnce()
  })
})

describe('updateTournamentBasicAction', () => {
  it('rejects when tournament is COMPLETED', async () => {
    requireDirector.mockResolvedValueOnce({
      me: { profile: { id: 'p1' } },
      org: { id: 'o1' },
      tournament: { id: 't1', orgId: 'o1', slug: 'champ-2026', status: 'COMPLETED' } as any,
    } as any)
    const { updateTournamentBasicAction } = await import('@/features/tournaments/actions/update')
    const fd = new FormData()
    fd.set('tournamentId', 't1')
    fd.set('name', 'New')
    fd.set('slug', 'new-slug')
    fd.set('description', '')
    fd.set('venue', 'V'); fd.set('address', 'A')
    fd.set('startDate', '2026-08-01T00:00:00Z'); fd.set('endDate', '2026-08-03T00:00:00Z')
    await expect(updateTournamentBasicAction(fd)).rejects.toThrow('CONFLICT')
  })
  it('rejects slug taken in same org', async () => {
    tournamentFindFirst.mockResolvedValue({ id: 'other' })
    const { updateTournamentBasicAction } = await import('@/features/tournaments/actions/update')
    const fd = new FormData()
    fd.set('tournamentId', 't1')
    fd.set('name', 'Champ')
    fd.set('slug', 'other-slug')
    fd.set('description', '')
    fd.set('venue', 'V'); fd.set('address', 'A')
    fd.set('startDate', '2026-08-01T00:00:00Z'); fd.set('endDate', '2026-08-03T00:00:00Z')
    const r = await updateTournamentBasicAction(fd)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe('CONFLICT')
  })
})

describe('updatePortalSettingsAction', () => {
  it('does not fire sensitive notification', async () => {
    const { updatePortalSettingsAction } = await import('@/features/tournaments/actions/update')
    const fd = new FormData()
    fd.set('tournamentId', 't1')
    fd.set('portalActive', 'true')
    const r = await updatePortalSettingsAction(fd)
    expect(r.ok).toBe(true)
    expect(notifySensitive).not.toHaveBeenCalled()
  })
})
