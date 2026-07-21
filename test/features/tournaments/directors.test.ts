import { describe, it, expect, vi, beforeEach } from 'vitest'

const findUnique = vi.fn()
const memberFindUnique = vi.fn()
const directorCreate = vi.fn(async ({ data }: any) => ({ id: 'td1', ...data }))
const directorDelete = vi.fn(async () => ({ id: 'td1' }))
const requireOwner = vi.fn(async () => ({
  me: { profile: { id: 'p1' } },
  org: { id: 'o1', ownerId: 'p1' },
}))
const tournamentFindUnique = vi.fn(async () => ({ id: 't1', orgId: 'o1', status: 'DRAFT' }))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    tournament: { findUnique: tournamentFindUnique },
    organizationMember: { findUnique: memberFindUnique },
    tournamentDirector: { findUnique, create: directorCreate, delete: directorDelete },
  },
}))
vi.mock('@/features/organizations/permissions', () => ({ requireOrgOwner: requireOwner }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

beforeEach(() => {
  findUnique.mockReset(); memberFindUnique.mockReset()
  directorCreate.mockClear(); directorDelete.mockClear()
  requireOwner.mockClear(); tournamentFindUnique.mockClear()
})

describe('assignDirectorAction', () => {
  it('rejects when target is not a member of the org', async () => {
    memberFindUnique.mockResolvedValue(null)
    const { assignDirectorAction } = await import('@/features/tournaments/actions/directors')
    const fd = new FormData(); fd.set('tournamentId', 't1'); fd.set('profileId', 'pX')
    const r = await assignDirectorAction(fd)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe('VALIDATION_ERROR')
  })
  it('rejects when target is already a director', async () => {
    memberFindUnique.mockResolvedValue({ role: 'MEMBER' })
    findUnique.mockResolvedValue({ id: 'td1' })
    const { assignDirectorAction } = await import('@/features/tournaments/actions/directors')
    const fd = new FormData(); fd.set('tournamentId', 't1'); fd.set('profileId', 'p2')
    const r = await assignDirectorAction(fd)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe('CONFLICT')
  })
  it('creates director when target is a member and not already director', async () => {
    memberFindUnique.mockResolvedValue({ role: 'MEMBER' })
    findUnique.mockResolvedValue(null)
    const { assignDirectorAction } = await import('@/features/tournaments/actions/directors')
    const fd = new FormData(); fd.set('tournamentId', 't1'); fd.set('profileId', 'p2')
    const r = await assignDirectorAction(fd)
    expect(r.ok).toBe(true)
    expect(directorCreate).toHaveBeenCalledOnce()
  })
})

describe('removeDirectorAction', () => {
  it('requires confirm=true', async () => {
    const { removeDirectorAction } = await import('@/features/tournaments/actions/directors')
    const fd = new FormData(); fd.set('tournamentId', 't1'); fd.set('profileId', 'p2')
    const r = await removeDirectorAction(fd)
    expect(r.ok).toBe(false)
  })
  it('deletes when confirm=true', async () => {
    findUnique.mockResolvedValue({ id: 'td1' })
    const { removeDirectorAction } = await import('@/features/tournaments/actions/directors')
    const fd = new FormData(); fd.set('tournamentId', 't1'); fd.set('profileId', 'p2'); fd.set('confirm', 'true')
    const r = await removeDirectorAction(fd)
    expect(r.ok).toBe(true)
    expect(directorDelete).toHaveBeenCalledOnce()
  })
})
