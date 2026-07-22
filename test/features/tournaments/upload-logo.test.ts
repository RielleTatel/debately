import { describe, it, expect, vi, beforeEach } from 'vitest'

const update = vi.fn(async ({ data }: any) => ({ id: 't1', ...data }))

vi.mock('@/lib/prisma', () => ({
  prisma: { tournament: { update } },
}))
vi.mock('@/features/tournaments/permissions', () => ({
  requireTournamentDirector: vi.fn(async () => ({
    me: { profile: { id: 'p1' } }, org: { id: 'o1' },
    tournament: { id: 't1', status: 'DRAFT' },
  })),
  assertTournamentEditable: () => {},
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))
vi.mock('@/services/storage/tournament-logos', () => ({
  tournamentLogoStorage: {
    validate: () => ({ ok: true }),
    upload: vi.fn(async () => 'https://example/tournament-logos/t1/logo-1.png'),
  },
}))

beforeEach(() => { update.mockClear() })

describe('uploadTournamentLogoAction', () => {
  it('rejects when no file is provided', async () => {
    const { uploadTournamentLogoAction } = await import('@/features/tournaments/actions/upload-logo')
    const fd = new FormData(); fd.set('tournamentId', 't1')
    const r = await uploadTournamentLogoAction(fd)
    expect(r.ok).toBe(false)
  })
  it('uploads and persists logo url', async () => {
    const { uploadTournamentLogoAction } = await import('@/features/tournaments/actions/upload-logo')
    const fd = new FormData()
    fd.set('tournamentId', 't1')
    fd.set('file', new File([new Uint8Array(4)], 'logo.png', { type: 'image/png' }))
    const r = await uploadTournamentLogoAction(fd)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.data.url).toContain('/tournament-logos/')
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ logoUrl: expect.any(String) }) }))
  })
})
