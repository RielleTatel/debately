import { describe, it, expect, vi, beforeEach } from 'vitest'

const tournamentFindUnique = vi.fn()
const orgFindUnique = vi.fn()
const memberFindUnique = vi.fn()
const directorFindUnique = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    tournament: { findUnique: tournamentFindUnique },
    organization: { findUnique: orgFindUnique },
    organizationMember: { findUnique: memberFindUnique },
    tournamentDirector: { findUnique: directorFindUnique },
  },
}))

vi.mock('@/features/auth/queries', () => ({
  requireVerifiedUser: vi.fn(async () => ({
    user: { id: 'u1', email: 'a@b.com' },
    profile: { id: 'p1', displayName: 'A', avatarUrl: null },
    isVerified: true,
  })),
}))

beforeEach(() => {
  tournamentFindUnique.mockReset()
  orgFindUnique.mockReset()
  memberFindUnique.mockReset()
  directorFindUnique.mockReset()
})

const tournamentWithOrg = (tournamentId: string, org: { id: string; ownerId: string }) => ({
  id: tournamentId,
  orgId: org.id,
  organization: org,
})

describe('requireTournamentReadable', () => {
  it('throws NOT_FOUND when tournament missing', async () => {
    tournamentFindUnique.mockResolvedValue(null)
    const { requireTournamentReadable } = await import('@/features/tournaments/permissions')
    await expect(requireTournamentReadable('t1')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
  it('throws FORBIDDEN when caller is not a member of the org', async () => {
    tournamentFindUnique.mockResolvedValue(tournamentWithOrg('t2', { id: 'o1', ownerId: 'p9' }))
    memberFindUnique.mockResolvedValue(null)
    const { requireTournamentReadable } = await import('@/features/tournaments/permissions')
    await expect(requireTournamentReadable('t2')).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })
  it('returns context when caller is a member', async () => {
    tournamentFindUnique.mockResolvedValue(tournamentWithOrg('t3', { id: 'o1', ownerId: 'p9' }))
    memberFindUnique.mockResolvedValue({ role: 'MEMBER' })
    const { requireTournamentReadable } = await import('@/features/tournaments/permissions')
    const ctx = await requireTournamentReadable('t3')
    expect(ctx.role).toBe('MEMBER')
    expect(ctx.tournament.id).toBe('t3')
  })
})

describe('requireTournamentDirector', () => {
  it('allows the org owner without an explicit director row', async () => {
    tournamentFindUnique.mockResolvedValue(tournamentWithOrg('t4', { id: 'o1', ownerId: 'p1' }))
    memberFindUnique.mockResolvedValue({ role: 'OWNER' })
    directorFindUnique.mockResolvedValue(null)
    const { requireTournamentDirector } = await import('@/features/tournaments/permissions')
    const ctx = await requireTournamentDirector('t4')
    expect(ctx.tournament.id).toBe('t4')
  })
  it('allows a non-owner with an explicit director row', async () => {
    tournamentFindUnique.mockResolvedValue(tournamentWithOrg('t5', { id: 'o1', ownerId: 'p9' }))
    memberFindUnique.mockResolvedValue({ role: 'MEMBER' })
    directorFindUnique.mockResolvedValue({ id: 'td1', tournamentId: 't5', profileId: 'p1' })
    const { requireTournamentDirector } = await import('@/features/tournaments/permissions')
    const ctx = await requireTournamentDirector('t5')
    expect(ctx.tournament.id).toBe('t5')
  })
  it('rejects a member who is not a director', async () => {
    tournamentFindUnique.mockResolvedValue(tournamentWithOrg('t6', { id: 'o1', ownerId: 'p9' }))
    memberFindUnique.mockResolvedValue({ role: 'MEMBER' })
    directorFindUnique.mockResolvedValue(null)
    const { requireTournamentDirector } = await import('@/features/tournaments/permissions')
    await expect(requireTournamentDirector('t6')).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })
})

describe('assertTournamentEditable', () => {
  it('throws CONFLICT on COMPLETED', async () => {
    const { assertTournamentEditable } = await import('@/features/tournaments/permissions')
    expect(() => assertTournamentEditable({ status: 'COMPLETED' } as any)).toThrow()
  })
  it('throws CONFLICT on ARCHIVED', async () => {
    const { assertTournamentEditable } = await import('@/features/tournaments/permissions')
    expect(() => assertTournamentEditable({ status: 'ARCHIVED' } as any)).toThrow()
  })
  it('allows DRAFT and ACTIVE', async () => {
    const { assertTournamentEditable } = await import('@/features/tournaments/permissions')
    expect(() => assertTournamentEditable({ status: 'DRAFT' } as any)).not.toThrow()
    expect(() => assertTournamentEditable({ status: 'ACTIVE' } as any)).not.toThrow()
  })
})
