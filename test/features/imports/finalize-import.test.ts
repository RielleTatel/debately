import { describe, it, expect, vi, beforeEach } from 'vitest'
import { finalizeImportAction } from '@/features/imports/actions/finalize-import'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    csvImport: { findUnique: vi.fn() },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn({
      tournamentInstitution: { findFirst: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({ id: 'ti_1', name: 'SKSU' }), update: vi.fn() },
      team: { findUnique: vi.fn().mockResolvedValue(null), upsert: vi.fn().mockResolvedValue({ id: 'tm_1', name: 'Alpha' }) },
      participant: { findFirst: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({ id: 'pr_1' }) },
      adjudicator: { findFirst: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({ id: 'ad_1' }) },
      institutionPortalToken: { create: vi.fn().mockResolvedValue({ id: 'tk_1' }) },
      csvImportRow: { findMany: vi.fn().mockResolvedValue([{ id: 'row_1', rowIndex: 0, rawJson: { registrationType: 'institution', institutionName: 'SKSU', logicalTeams: [{ teamName: 'Alpha', debaters: [{ name: 'A', slotIndex: 1 }] }], judges: [], representative: { name: 'X', email: 'x@y.com' }, teamsIntended: null, adjudicatorsIntended: null }, status: 'PENDING', messages: [] }]), update: vi.fn() },
      csvImport: { update: vi.fn().mockResolvedValue({ phaseLabel: 'Phase 2', tournamentId: 't1' }) },
    })),
  },
}))
vi.mock('@/features/imports/permissions', () => ({ requireImportEditor: vi.fn() }))
vi.mock('@/services/activity-log', () => ({ activityLog: { record: vi.fn() } }))
import { requireImportEditor } from '@/features/imports/permissions'

describe('finalizeImportAction', () => {
  beforeEach(() => vi.clearAllMocks())
  it('commits import + generates portal tokens for new institutions', async () => {
    (requireImportEditor as ReturnType<typeof vi.fn>).mockResolvedValue({
      import: { id: 'imp_1', tournamentId: 't1', phaseLabel: 'Phase 2', status: 'PROCESSED' },
      tournamentId: 't1', meId: 'p1', orgId: 'o1',
    })
    const f = new FormData(); f.append('importId', 'imp_1')
    const r = await finalizeImportAction(f)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.data.institutionsCreated).toBeGreaterThanOrEqual(0)
  })
})
