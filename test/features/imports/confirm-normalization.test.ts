import { describe, it, expect, vi, beforeEach } from 'vitest'
import { confirmNormalizationAction } from '@/features/imports/actions/confirm-normalization'

vi.mock('@/features/imports/permissions', () => ({ requireImportEditor: vi.fn() }))
vi.mock('@/features/imports/services/normalize-institution', () => ({ applyConfirmedAlias: vi.fn() }))
vi.mock('@/services/activity-log', () => ({ activityLog: { record: vi.fn() } }))
import { requireImportEditor } from '@/features/imports/permissions'
import { applyConfirmedAlias } from '@/features/imports/services/normalize-institution'

describe('confirmNormalizationAction', () => {
  beforeEach(() => vi.clearAllMocks())
  it('applies alias on confirm', async () => {
    (requireImportEditor as ReturnType<typeof vi.fn>).mockResolvedValue({
      import: { id: 'i', tournamentId: 't1' }, tournamentId: 't1', meId: 'p1', orgId: 'o1',
    })
    const f = new FormData()
    f.append('importId', 'i'); f.append('rawName', 'ADU')
    f.append('decision', 'confirm'); f.append('targetInstitutionId', 'ti_1')
    const r = await confirmNormalizationAction(f)
    expect(r.ok).toBe(true)
    expect(applyConfirmedAlias).toHaveBeenCalledWith('t1', 'ADU', 'ti_1')
  })
  it('is a no-op on reject', async () => {
    (requireImportEditor as ReturnType<typeof vi.fn>).mockResolvedValue({
      import: { id: 'i', tournamentId: 't1' }, tournamentId: 't1', meId: 'p1', orgId: 'o1',
    })
    const f = new FormData()
    f.append('importId', 'i'); f.append('rawName', 'ADU'); f.append('decision', 'reject')
    const r = await confirmNormalizationAction(f)
    expect(r.ok).toBe(true)
    expect(applyConfirmedAlias).not.toHaveBeenCalled()
  })
})
