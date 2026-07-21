import { describe, it, expect, vi, beforeEach } from 'vitest'
import { applyDiffAction } from '@/features/imports/actions/apply-diff'

vi.mock('@/lib/prisma', () => ({
  prisma: { csvImportRow: { findFirst: vi.fn(), update: vi.fn() } },
}))
vi.mock('@/features/imports/permissions', () => ({ requireImportEditor: vi.fn() }))
vi.mock('@/services/activity-log', () => ({ activityLog: { record: vi.fn() } }))
import { prisma } from '@/lib/prisma'
import { requireImportEditor } from '@/features/imports/permissions'

describe('applyDiffAction', () => {
  beforeEach(() => vi.clearAllMocks())
  it('stores DIFF_DECISION marker with mode=apply', async () => {
    (requireImportEditor as ReturnType<typeof vi.fn>).mockResolvedValue({
      import: { id: 'i' }, tournamentId: 't1', meId: 'p1', orgId: 'o1',
    })
    ;(prisma.csvImportRow.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'row_1', importId: 'i', rowIndex: 3, status: 'PENDING', messages: [],
    })
    const f = new FormData()
    f.append('importId', 'i'); f.append('rowIndex', '3'); f.append('mode', 'apply'); f.append('selectedFields', '[]')
    const r = await applyDiffAction(f)
    expect(r.ok).toBe(true)
    expect(prisma.csvImportRow.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'RESUBMISSION' }),
    }))
  })
  it('rejects apply-selected with empty fields', async () => {
    const f = new FormData()
    f.append('importId', 'i'); f.append('rowIndex', '3'); f.append('mode', 'apply-selected'); f.append('selectedFields', '[]')
    const r = await applyDiffAction(f)
    expect(r.ok).toBe(false)
  })
})
