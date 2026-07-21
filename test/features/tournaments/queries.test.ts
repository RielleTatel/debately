import { describe, it, expect, vi, beforeEach } from 'vitest'

const findMany = vi.fn()
const findUnique = vi.fn()
const memberFindMany = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    tournament: { findMany, findUnique },
    tournamentDirector: { findMany: vi.fn(async () => []) },
    tournamentScheduleEntry: { findMany: vi.fn(async () => []) },
    organizationMember: { findMany: memberFindMany },
    organization: { findUnique: vi.fn(async () => ({ id: 'o1', slug: 'my-org', name: 'My Org' })) },
  },
}))

vi.mock('@/features/auth/queries', () => ({
  requireUser: vi.fn(async () => ({ profile: { id: 'p1' }, user: { id: 'u1' } })),
}))

vi.mock('@/features/tournaments/permissions', () => ({
  requireTournamentReadable: vi.fn(async (id: string) => ({
    me: { profile: { id: 'p1' } },
    tournament: { id, orgId: 'o1', status: 'DRAFT' },
    org: { id: 'o1', slug: 'my-org' },
    role: 'OWNER',
    isDirector: true,
  })),
}))

beforeEach(() => {
  findMany.mockReset(); findUnique.mockReset(); memberFindMany.mockReset()
})

describe('getTournamentContext', () => {
  it('returns { tournament, org, role, isDirector }', async () => {
    const { getTournamentContext } = await import('@/features/tournaments/queries')
    const ctx = await getTournamentContext('t1')
    expect(ctx.tournament.id).toBe('t1')
    expect(ctx.org.slug).toBe('my-org')
    expect(ctx.isDirector).toBe(true)
  })
})

describe('listTournamentsForOrg', () => {
  it('delegates to prisma with orgId', async () => {
    findMany.mockResolvedValue([{ id: 't1' }, { id: 't2' }])
    const { listTournamentsForOrg } = await import('@/features/tournaments/queries')
    const rows = await listTournamentsForOrg('o1')
    expect(rows).toHaveLength(2)
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { orgId: 'o1' } }))
  })
})

describe('resolveTournamentByOrgAndId', () => {
  it('returns null when tournament missing', async () => {
    findUnique.mockResolvedValue(null)
    const { resolveTournamentByOrgAndId } = await import('@/features/tournaments/queries')
    expect(await resolveTournamentByOrgAndId('my-org', 't1')).toBeNull()
  })
  it('returns null when tournament belongs to different org', async () => {
    findUnique.mockResolvedValue({ id: 't1', orgId: 'other' })
    const { resolveTournamentByOrgAndId } = await import('@/features/tournaments/queries')
    expect(await resolveTournamentByOrgAndId('my-org', 't1')).toBeNull()
  })
  it('returns tournament when org matches', async () => {
    findUnique.mockResolvedValue({ id: 't1', orgId: 'o1' })
    const { resolveTournamentByOrgAndId } = await import('@/features/tournaments/queries')
    expect(await resolveTournamentByOrgAndId('my-org', 't1')).toEqual({ id: 't1', orgId: 'o1' })
  })
})
