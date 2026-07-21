import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requireImportEditor } from '@/features/imports/permissions'

vi.mock('@/lib/prisma', () => ({
  prisma: { csvImport: { findUnique: vi.fn() } },
}))
vi.mock('@/features/tournaments/permissions', () => ({
  requireTournamentDirector: vi.fn(),
  requireTournamentReadable: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { requireTournamentDirector } from '@/features/tournaments/permissions'

describe('requireImportEditor', () => {
  beforeEach(() => vi.clearAllMocks())
  it('throws NOT_FOUND when the import does not exist', async () => {
    (prisma.csvImport.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    await expect(requireImportEditor('missing')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
  it('delegates to requireTournamentDirector on the resolved tournamentId', async () => {
    (prisma.csvImport.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'imp_1', tournamentId: 't_1' })
    ;(requireTournamentDirector as ReturnType<typeof vi.fn>).mockResolvedValue({
      me: { profile: { id: 'p_1' } }, tournament: { id: 't_1' }, org: { id: 'o_1' },
    })
    const ctx = await requireImportEditor('imp_1')
    expect(requireTournamentDirector).toHaveBeenCalledWith('t_1')
    expect(ctx.import.id).toBe('imp_1')
  })
})
