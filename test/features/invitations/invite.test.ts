import { describe, it, expect, vi, beforeEach } from 'vitest'
const requireOrgOwner = vi.fn(); const inviteFindFirst = vi.fn(); const inviteCreate = vi.fn(); const sendInvite = vi.fn()

vi.mock('@/features/organizations/permissions', () => ({ requireOrgOwner }))
vi.mock('@/lib/prisma', () => ({
  prisma: { organizationInvitation: { findFirst: inviteFindFirst, create: inviteCreate } },
}))
vi.mock('@/services/email', () => ({ emailService: { sendOrganizationInvite: sendInvite } }))
vi.mock('@/services/logger', () => ({ logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() } }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

beforeEach(() => { requireOrgOwner.mockReset(); inviteFindFirst.mockReset(); inviteCreate.mockReset(); sendInvite.mockReset() })

describe('inviteMemberAction', () => {
  it('rejects bad email', async () => {
    const { inviteMemberAction } = await import('@/features/invitations/actions/invite')
    const fd = new FormData(); fd.set('orgId', 'o1'); fd.set('email', 'nope'); fd.set('role', 'MEMBER')
    expect((await inviteMemberAction(fd)).ok).toBe(false)
  })
  it('rejects duplicate pending invite', async () => {
    requireOrgOwner.mockResolvedValue({ me: { profile: { displayName: 'A' } }, org: { id: 'o1', name: 'O', slug: 's' } })
    inviteFindFirst.mockResolvedValue({ id: 'i1' })
    const { inviteMemberAction } = await import('@/features/invitations/actions/invite')
    const fd = new FormData(); fd.set('orgId', 'o1'); fd.set('email', 'a@b.com'); fd.set('role', 'MEMBER')
    expect((await inviteMemberAction(fd)).ok).toBe(false)
  })
  it('creates + sends email', async () => {
    requireOrgOwner.mockResolvedValue({ me: { profile: { displayName: 'A' } }, org: { id: 'o1', name: 'O', slug: 's' } })
    inviteFindFirst.mockResolvedValue(null); inviteCreate.mockResolvedValue({ id: 'i1', token: 'tok' }); sendInvite.mockResolvedValue(undefined)
    const { inviteMemberAction } = await import('@/features/invitations/actions/invite')
    const fd = new FormData(); fd.set('orgId', 'o1'); fd.set('email', 'a@b.com'); fd.set('role', 'MEMBER')
    const r = await inviteMemberAction(fd)
    expect(r.ok).toBe(true); expect(sendInvite).toHaveBeenCalledOnce()
  })
})
