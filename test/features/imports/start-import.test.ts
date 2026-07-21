import { describe, it, expect, vi, beforeEach } from 'vitest'
import { startCsvImportAction } from '@/features/imports/actions/start-import'

vi.mock('@/lib/prisma', () => ({
  prisma: { csvImport: { create: vi.fn(), update: vi.fn() } },
}))
vi.mock('@/features/tournaments/permissions', () => ({
  requireTournamentDirector: vi.fn(),
  assertTournamentEditable: vi.fn(),
}))
vi.mock('@/services/storage', () => ({
  tournamentImportsStorage: { validate: () => ({ ok: true }), upload: vi.fn() },
}))

import { prisma } from '@/lib/prisma'
import { requireTournamentDirector } from '@/features/tournaments/permissions'
import { tournamentImportsStorage } from '@/services/storage'

function fd(fields: Record<string, string | File>): FormData {
  const f = new FormData()
  for (const [k, v] of Object.entries(fields)) f.append(k, v as never)
  return f
}

describe('startCsvImportAction', () => {
  beforeEach(() => vi.clearAllMocks())
  it('creates a staging import + uploads CSV', async () => {
    (requireTournamentDirector as ReturnType<typeof vi.fn>).mockResolvedValue({
      me: { profile: { id: 'p1' } }, tournament: { id: 't1', status: 'ACTIVE' }, org: { id: 'o1' },
    })
    ;(prisma.csvImport.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'imp_1' })
    ;(prisma.csvImport.update as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'imp_1' })
    ;(tournamentImportsStorage.upload as ReturnType<typeof vi.fn>).mockResolvedValue('t1/imp_1.csv')
    const file = new File(['h1,h2\n1,2'], 'reg.csv', { type: 'text/csv' })
    const result = await startCsvImportAction(fd({
      tournamentId: 't1', phaseLabel: 'Phase 2 — Team Registration', file,
    }))
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.importId).toBe('imp_1')
  })
  it('rejects on missing file', async () => {
    (requireTournamentDirector as ReturnType<typeof vi.fn>).mockResolvedValue({
      me: { id: 'p1' }, tournament: { id: 't1' }, org: { id: 'o1' },
    })
    const result = await startCsvImportAction(fd({ tournamentId: 't1', phaseLabel: 'Phase 2' }))
    expect(result.ok).toBe(false)
  })
})
