import { describe, it, expect, vi, beforeEach } from 'vitest'
const requireOrgOwner = vi.fn()
const upload = vi.fn(async () => 'https://example.com/x/logo.png')
const update = vi.fn()

vi.mock('@/features/organizations/permissions', () => ({ requireOrgOwner }))
vi.mock('@/services/storage/org-logos', () => ({ orgLogoStorage: { validate: () => ({ ok: true }), upload } }))
vi.mock('@/lib/prisma', () => ({ prisma: { organization: { update } } }))

beforeEach(() => { requireOrgOwner.mockReset(); upload.mockClear(); update.mockClear() })

describe('uploadOrgLogoAction', () => {
  it('rejects when no file', async () => {
    const { uploadOrgLogoAction } = await import('@/features/organizations/actions/upload-logo')
    const fd = new FormData(); fd.set('orgId', 'o1')
    expect((await uploadOrgLogoAction(fd)).ok).toBe(false)
  })
  it('uploads and updates logoUrl', async () => {
    requireOrgOwner.mockResolvedValue({ me: {}, org: { id: 'o1' } })
    const { uploadOrgLogoAction } = await import('@/features/organizations/actions/upload-logo')
    const file = new File([new Uint8Array([1,2,3])], 'l.png', { type: 'image/png' })
    const fd = new FormData(); fd.set('orgId', 'o1'); fd.set('file', file)
    const r = await uploadOrgLogoAction(fd)
    expect(r.ok).toBe(true)
    expect(update).toHaveBeenCalledOnce()
  })
})
