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
vi.mock('@/services/storage/tournament-rules', () => ({
  tournamentRulesStorage: {
    validate: (f: File) => f.type === 'application/pdf' ? { ok: true } : { ok: false, message: 'Only PDF allowed' },
    upload: vi.fn(async () => 'https://example/tournament-rules/t1/rules-1.pdf'),
  },
}))

beforeEach(() => { update.mockClear() })

describe('uploadRulesPdfAction', () => {
  it('rejects non-pdf file', async () => {
    const { uploadRulesPdfAction } = await import('@/features/tournaments/actions/upload-rules')
    const fd = new FormData()
    fd.set('tournamentId', 't1')
    fd.set('file', new File([new Uint8Array(4)], 'r.png', { type: 'image/png' }))
    const r = await uploadRulesPdfAction(fd)
    expect(r.ok).toBe(false)
  })
  it('accepts a PDF', async () => {
    const { uploadRulesPdfAction } = await import('@/features/tournaments/actions/upload-rules')
    const fd = new FormData()
    fd.set('tournamentId', 't1')
    fd.set('file', new File([new Uint8Array(4)], 'r.pdf', { type: 'application/pdf' }))
    const r = await uploadRulesPdfAction(fd)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.data.url).toContain('/tournament-rules/')
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ rulesUrl: expect.any(String) }) }))
  })
})
