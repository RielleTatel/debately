import { describe, it, expect, vi, beforeEach } from 'vitest'

const tournamentCreate = vi.fn(async ({ data }: any) => ({ id: 't1', ...data }))
const tournamentFindFirst = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    tournament: { create: tournamentCreate, findFirst: tournamentFindFirst },
  },
}))

vi.mock('@/features/organizations/permissions', () => ({
  requireOrgMember: vi.fn(async () => ({
    me: { profile: { id: 'p1' } },
    org: { id: 'o1', slug: 'my-org' },
    role: 'OWNER',
  })),
}))

vi.mock('next/navigation', () => ({ redirect: (u: string) => { throw new Error('REDIRECT:' + u) } }))

const validFd = () => {
  const fd = new FormData()
  fd.set('orgId', 'o1')
  fd.set('name', 'Champ 2026')
  fd.set('slug', 'champ-2026')
  fd.set('format', 'BP')
  fd.set('startDate', '2026-08-01T00:00:00Z')
  fd.set('endDate', '2026-08-03T00:00:00Z')
  fd.set('registrationDeadline', '2026-07-25T00:00:00Z')
  fd.set('venue', 'Main Hall')
  fd.set('address', '123 Debate St')
  fd.set('maxTeamSlots', '32')
  return fd
}

beforeEach(() => {
  tournamentCreate.mockClear(); tournamentFindFirst.mockReset()
})

describe('createTournamentAction', () => {
  it('rejects reserved slug', async () => {
    const fd = validFd(); fd.set('slug', 'settings')
    const { createTournamentAction } = await import('@/features/tournaments/actions/create')
    const r = await createTournamentAction(fd)
    expect(r.ok).toBe(false)
  })
  it('rejects when slug already taken in org', async () => {
    tournamentFindFirst.mockResolvedValue({ id: 'existing' })
    const { createTournamentAction } = await import('@/features/tournaments/actions/create')
    const r = await createTournamentAction(validFd())
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe('CONFLICT')
  })
  it('creates + redirects to settings on success', async () => {
    tournamentFindFirst.mockResolvedValue(null)
    const { createTournamentAction } = await import('@/features/tournaments/actions/create')
    await expect(createTournamentAction(validFd())).rejects.toThrow('REDIRECT:/tournaments/t1/settings')
  })
  it('rejects missing orgId', async () => {
    const fd = validFd(); fd.delete('orgId')
    const { createTournamentAction } = await import('@/features/tournaments/actions/create')
    const r = await createTournamentAction(fd)
    expect(r.ok).toBe(false)
  })
})
