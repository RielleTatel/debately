import { describe, it, expect, vi, beforeEach } from 'vitest'

const getUser = vi.fn()
const signIn = vi.fn()
const updateUser = vi.fn()
const findUnique = vi.fn()
const update = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser, signInWithPassword: signIn, updateUser, signUp: vi.fn(), signOut: vi.fn(), resetPasswordForEmail: vi.fn() },
  }),
}))
vi.mock('@/lib/prisma', () => ({ prisma: { profile: { findUnique, update } } }))

beforeEach(() => {
  getUser.mockReset(); signIn.mockReset(); updateUser.mockReset(); findUnique.mockReset(); update.mockReset()
  getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'me@x.com', email_confirmed_at: 't' } }, error: null })
  findUnique.mockResolvedValue({ id: 'p1', displayName: 'Old', avatarUrl: null })
})

describe('updateProfileAction', () => {
  it('updates display name', async () => {
    update.mockResolvedValue({ id: 'p1' })
    const { updateProfileAction } = await import('@/features/auth/actions/update-profile')
    const fd = new FormData(); fd.set('displayName', 'New Name')
    const r = await updateProfileAction(fd)
    expect(r.ok).toBe(true)
    expect(update).toHaveBeenCalledWith({ where: { userId: 'u1' }, data: { displayName: 'New Name' } })
  })
})

describe('changePasswordAction', () => {
  it('rejects when current password is wrong', async () => {
    signIn.mockResolvedValue({ data: null, error: { message: 'nope' } })
    const { changePasswordAction } = await import('@/features/auth/actions/change-password')
    const fd = new FormData()
    fd.set('currentPassword', 'x'); fd.set('newPassword', 'Valid1Password'); fd.set('confirmPassword', 'Valid1Password')
    const r = await changePasswordAction(fd)
    expect(r.ok).toBe(false)
  })
  it('updates when current password valid', async () => {
    signIn.mockResolvedValue({ data: { session: {} }, error: null })
    updateUser.mockResolvedValue({ error: null })
    const { changePasswordAction } = await import('@/features/auth/actions/change-password')
    const fd = new FormData()
    fd.set('currentPassword', 'Correct1Password'); fd.set('newPassword', 'Valid1Password'); fd.set('confirmPassword', 'Valid1Password')
    const r = await changePasswordAction(fd)
    expect(r.ok).toBe(true)
    expect(updateUser).toHaveBeenCalledWith({ password: 'Valid1Password' })
  })
})

describe('changeEmailAction', () => {
  it('triggers re-verification on new email', async () => {
    signIn.mockResolvedValue({ data: { session: {} }, error: null })
    updateUser.mockResolvedValue({ error: null })
    const { changeEmailAction } = await import('@/features/auth/actions/change-email')
    const fd = new FormData(); fd.set('newEmail', 'new@x.com'); fd.set('currentPassword', 'Correct1Password')
    const r = await changeEmailAction(fd)
    expect(r.ok).toBe(true)
    expect(updateUser).toHaveBeenCalledWith({ email: 'new@x.com' })
  })
})
