import { describe, it, expect, vi, beforeEach } from 'vitest'
import { rollbackImportAction } from '@/features/imports/actions/rollback-import'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    csvImport: { update: vi.fn().mockResolvedValue({ id: 'i', tournamentId: 't1' }) },
  },
}))
vi.mock('@/features/imports/permissions', () => ({ requireImportEditor: vi.fn() }))
vi.mock('@/services/activity-log', () => ({ activityLog: { record: vi.fn() } }))
import { requireImportEditor } from '@/features/imports/permissions'

describe('rollbackImportAction', () => {
  beforeEach(() => vi.clearAllMocks())
  it('rejects when confirm != true', async () => {
    const f = new FormData(); f.append('importId', 'i')
    const r = await rollbackImportAction(f)
    expect(r.ok).toBe(false)
  })
  it('marks import ROLLED_BACK when confirmed', async () => {
    (requireImportEditor as ReturnType<typeof vi.fn>).mockResolvedValue({
      import: { id: 'i', tournamentId: 't1', status: 'FINALIZED' }, tournamentId: 't1', meId: 'p1', orgId: 'o1',
    })
    const f = new FormData(); f.append('importId', 'i'); f.append('confirm', 'true')
    const r = await rollbackImportAction(f)
    expect(r.ok).toBe(true)
  })
})
