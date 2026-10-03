import { describe, it, expect, vi, beforeEach } from 'vitest'
import { confirmNormalizationAction } from '@/features/imports/actions/confirm-normalization'

vi.mock('@/features/imports/permissions', () => ({ requireImportEditor: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
      callback({
        $queryRaw: async () => [{ status: 'PROCESSED' }],
        $executeRaw: async () => 2,
        tournamentInstitution: { findFirst: async () => ({ id: 'ti_1' }) },
        institutionAlias: { upsert: async () => undefined },
      }),
  },
}))
vi.mock('@/services/activity-log', () => ({ activityLog: { record: vi.fn() } }))
import { requireImportEditor } from '@/features/imports/permissions'

describe('confirmNormalizationAction', () => {
  beforeEach(() => vi.clearAllMocks())
  it('applies alias on confirm', async () => {
    ;(requireImportEditor as ReturnType<typeof vi.fn>).mockResolvedValue({
      import: { id: 'i', tournamentId: 't1' },
      tournamentId: 't1',
      meId: 'p1',
      orgId: 'o1',
    })
    const f = new FormData()
    f.append('importId', 'i')
    f.append('rawName', 'ADU')
    f.append('decision', 'confirm')
    f.append('targetInstitutionId', 'ti_1')
    const r = await confirmNormalizationAction(f)
    expect(r.ok).toBe(true)
    expect(r).toEqual({ ok: true, data: { importId: 'i' } })
  })
  it('accepts a decision to keep the name separate', async () => {
    ;(requireImportEditor as ReturnType<typeof vi.fn>).mockResolvedValue({
      import: { id: 'i', tournamentId: 't1' },
      tournamentId: 't1',
      meId: 'p1',
      orgId: 'o1',
    })
    const f = new FormData()
    f.append('importId', 'i')
    f.append('rawName', 'ADU')
    f.append('decision', 'reject')
    const r = await confirmNormalizationAction(f)
    expect(r.ok).toBe(true)
    expect(r).toEqual({ ok: true, data: { importId: 'i' } })
  })
})
