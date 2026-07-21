import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processImportAction } from '@/features/imports/actions/process-import'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    csvImport: { findUnique: vi.fn(), update: vi.fn() },
    csvImportRow: { deleteMany: vi.fn(), createMany: vi.fn() },
    tournament: { findUnique: vi.fn() },
  },
}))
vi.mock('@/features/imports/permissions', () => ({ requireImportEditor: vi.fn() }))
vi.mock('@/services/storage', () => ({
  tournamentImportsStorage: { readText: vi.fn() },
}))

import { prisma } from '@/lib/prisma'
import { requireImportEditor } from '@/features/imports/permissions'
import { tournamentImportsStorage } from '@/services/storage'

describe('processImportAction', () => {
  beforeEach(() => vi.clearAllMocks())

  it('parses rows + stores per-row status', async () => {
    (requireImportEditor as ReturnType<typeof vi.fn>).mockResolvedValue({
      import: {
        id: 'imp_1', tournamentId: 't1', storagePath: 't1/imp_1.csv',
        mappingJson: {
          entries: [
            { header: 'Type', field: 'registration_type' },
            { header: 'Institution', field: 'institution_name' },
            { header: 'Team', field: 'team_name' },
            { header: 'Debater 1', field: 'debater_name', slotIndex: 1 },
          ],
          repeatGroups: [],
        },
        phaseLabel: 'Phase 2',
      },
      tournamentId: 't1', orgId: 'o1', meId: 'p1',
    })
    ;(tournamentImportsStorage.readText as ReturnType<typeof vi.fn>).mockResolvedValue(
      'Type,Institution,Team,Debater 1\nInstitution,SKSU,Alpha,A\nInstitution,SKSU,,\nInstitution,,Alpha,\n',
    )
    ;(prisma.tournament.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 't1', formatConfig: { speakerCount: 3, customEligibility: '' },
    })
    ;(prisma.csvImportRow.createMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 3 })
    ;(prisma.csvImport.update as ReturnType<typeof vi.fn>).mockResolvedValue({})
    const r = await processImportAction('imp_1')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.data.rowsTotal).toBe(3)
      expect(r.data.rowsWithWarnings + r.data.rowsWithErrors).toBeGreaterThan(0)
    }
  })

  it('rejects when mapping is missing', async () => {
    (requireImportEditor as ReturnType<typeof vi.fn>).mockResolvedValue({
      import: { id: 'imp_1', tournamentId: 't1', storagePath: 'x', mappingJson: null, phaseLabel: 'P1' },
      tournamentId: 't1', orgId: 'o1', meId: 'p1',
    })
    const r = await processImportAction('imp_1')
    expect(r.ok).toBe(false)
  })
})
