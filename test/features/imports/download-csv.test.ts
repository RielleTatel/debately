import { describe, it, expect, vi, beforeEach } from 'vitest'
import { downloadErrorRowsCsvAction } from '@/features/imports/actions/download-csv'

vi.mock('@/lib/prisma', () => ({
  prisma: { csvImportRow: { findMany: vi.fn() } },
}))
vi.mock('@/features/imports/permissions', () => ({ requireImportReadable: vi.fn() }))
import { prisma } from '@/lib/prisma'
import { requireImportReadable } from '@/features/imports/permissions'

describe('downloadErrorRowsCsvAction', () => {
  beforeEach(() => vi.clearAllMocks())
  it('returns a CSV containing all ERROR rows', async () => {
    (requireImportReadable as ReturnType<typeof vi.fn>).mockResolvedValue({
      import: { id: 'i', tournamentId: 't1', phaseLabel: 'Phase 2' }, tournamentId: 't1', meId: 'p1', orgId: 'o1',
    })
    ;(prisma.csvImportRow.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { rowIndex: 3, rawJson: { raw: { Institution: 'SKSU', 'Team Name': '' } }, messages: ['[error] team_name: Missing team_name'] },
    ])
    const r = await downloadErrorRowsCsvAction('i')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.data.csv).toContain('row_index')
      expect(r.data.csv).toContain('SKSU')
      expect(r.data.filename).toContain('errors')
    }
  })
})
