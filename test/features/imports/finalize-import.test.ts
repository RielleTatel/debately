import { describe, it, expect, vi, beforeEach } from 'vitest'
import { finalizeImportAction } from '@/features/imports/actions/finalize-import'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    csvImport: { findUnique: vi.fn() },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        tournamentInstitution: { findMany: vi.fn().mockResolvedValue([]), createMany: vi.fn() },
        institutionAlias: { findMany: vi.fn().mockResolvedValue([]) },
        team: { findMany: vi.fn().mockResolvedValue([]), createMany: vi.fn() },
        participant: { findMany: vi.fn().mockResolvedValue([]), createMany: vi.fn() },
        adjudicator: { findMany: vi.fn().mockResolvedValue([]), createMany: vi.fn() },
        institutionPortalToken: { createMany: vi.fn() },
        csvImportRow: {
          findMany: vi
            .fn()
            .mockResolvedValue([
              {
                id: 'row_1',
                rowIndex: 0,
                rawJson: {
                  registrationType: 'institution',
                  institutionName: 'SKSU',
                  logicalTeams: [
                    {
                      teamName: 'Alpha',
                      isNovice: false,
                      debaters: [{ name: 'A', email: null, phone: null, slotIndex: 1 }],
                    },
                  ],
                  judges: [],
                  representative: { name: 'X', email: 'x@y.com', phone: null },
                  teamsIntended: null,
                  adjudicatorsIntended: null,
                },
                status: 'PENDING',
                messages: [],
              },
            ]),
          updateMany: vi.fn(),
        },
        csvImport: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          findUniqueOrThrow: vi
            .fn()
            .mockResolvedValue({ phaseLabel: 'Phase 2', tournamentId: 't1' }),
          update: vi.fn(),
        },
      }),
    ),
  },
}))
vi.mock('@/features/imports/permissions', () => ({ requireImportEditor: vi.fn() }))
vi.mock('@/services/activity-log', () => ({ activityLog: { record: vi.fn() } }))
import { requireImportEditor } from '@/features/imports/permissions'

describe('finalizeImportAction', () => {
  beforeEach(() => vi.clearAllMocks())
  it('commits import + generates portal tokens for new institutions', async () => {
    ;(requireImportEditor as ReturnType<typeof vi.fn>).mockResolvedValue({
      import: { id: 'imp_1', tournamentId: 't1', phaseLabel: 'Phase 2', status: 'PROCESSED' },
      tournamentId: 't1',
      meId: 'p1',
      orgId: 'o1',
    })
    const f = new FormData()
    f.append('importId', 'imp_1')
    const r = await finalizeImportAction(f)
    expect(r.ok).toBe(true)
    if (r.ok)
      expect(r.data).toEqual({
        institutionsCreated: 1,
        teamsCreated: 1,
        participantsCreated: 1,
        adjudicatorsCreated: 0,
        recordsUpdatedViaReimport: 0,
        rowsImported: 1,
        rowsSkipped: 0,
      })
  })
})
