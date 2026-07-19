import { describe, it, expect, vi, beforeEach } from 'vitest'

const upload = vi.fn()
const getPublicUrl = vi.fn(() => ({ data: { publicUrl: 'https://cdn/x.png' } }))
const from = vi.fn(() => ({ upload, getPublicUrl }))
const getUser = vi.fn()
const update = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser, signUp: vi.fn(), signInWithPassword: vi.fn(), signOut: vi.fn() },
    storage: { from },
  }),
}))
vi.mock('@/lib/prisma', () => ({ prisma: { profile: { findUnique: vi.fn(async () => ({ id: 'p1', displayName: 'A' })), update } } }))

beforeEach(() => {
  upload.mockReset(); update.mockReset(); getUser.mockReset()
  getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.com', email_confirmed_at: 't' } }, error: null })
  upload.mockResolvedValue({ data: { path: 'u1/avatar.png' }, error: null })
})

describe('uploadAvatarAction', () => {
  it('rejects unsupported MIME', async () => {
    const { uploadAvatarAction } = await import('@/features/auth/actions/upload-avatar')
    const file = new File(['x'], 'x.gif', { type: 'image/gif' })
    const fd = new FormData(); fd.set('file', file)
    const r = await uploadAvatarAction(fd)
    expect(r.ok).toBe(false)
  })
  it('rejects file > 2MB', async () => {
    const { uploadAvatarAction } = await import('@/features/auth/actions/upload-avatar')
    const big = new File([new Uint8Array(2_100_000)], 'x.png', { type: 'image/png' })
    const fd = new FormData(); fd.set('file', big)
    const r = await uploadAvatarAction(fd)
    expect(r.ok).toBe(false)
  })
  it('uploads and persists URL', async () => {
    const { uploadAvatarAction } = await import('@/features/auth/actions/upload-avatar')
    const ok = new File([new Uint8Array(1000)], 'x.png', { type: 'image/png' })
    const fd = new FormData(); fd.set('file', ok)
    const r = await uploadAvatarAction(fd)
    expect(r.ok).toBe(true)
    expect(update).toHaveBeenCalledWith({ where: { userId: 'u1' }, data: { avatarUrl: 'https://cdn/x.png' } })
  })
})
