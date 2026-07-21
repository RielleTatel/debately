import { describe, it, expect } from 'vitest'
import {
  phaseLabelSchema,
  startImportSchema,
  saveMappingSchema,
  applyDiffSchema,
  confirmNormalizationSchema,
  finalizeImportSchema,
} from '@/features/imports/schemas'

describe('phaseLabelSchema', () => {
  it('accepts a labeled phase', () => {
    expect(phaseLabelSchema.parse('Phase 2 — Team Registration')).toBe('Phase 2 — Team Registration')
  })
  it('rejects empty and 200+ char labels', () => {
    expect(phaseLabelSchema.safeParse('').success).toBe(false)
    expect(phaseLabelSchema.safeParse('x'.repeat(201)).success).toBe(false)
  })
})

describe('startImportSchema', () => {
  it('requires tournamentId + phaseLabel', () => {
    expect(startImportSchema.safeParse({}).success).toBe(false)
    expect(startImportSchema.safeParse({ tournamentId: 't1', phaseLabel: 'Phase 1' }).success).toBe(true)
  })
})

describe('saveMappingSchema', () => {
  const valid = {
    importId: 'imp_1',
    mapping: {
      entries: [
        { header: 'Institution', field: 'institution_name' },
        { header: 'Team Name', field: 'team_name' },
        { header: 'Consent', field: 'ignore' },
      ],
      repeatGroups: [{ name: 'team-2', repetitions: 2 }],
    },
  }
  it('accepts a valid mapping', () => {
    expect(saveMappingSchema.parse(valid)).toEqual(valid)
  })
  it('rejects unknown system field', () => {
    expect(saveMappingSchema.safeParse({ ...valid, mapping: { entries: [{ header: 'X', field: 'bogus' }], repeatGroups: [] } }).success).toBe(false)
  })
})

describe('applyDiffSchema', () => {
  it('accepts apply / keep-existing modes', () => {
    for (const mode of ['apply', 'keep-existing'] as const) {
      expect(applyDiffSchema.safeParse({ importId: 'i', rowIndex: 1, mode, selectedFields: [] }).success).toBe(true)
    }
    expect(applyDiffSchema.safeParse({ importId: 'i', rowIndex: 1, mode: 'apply-selected', selectedFields: ['team_name'] }).success).toBe(true)
  })
  it('rejects apply-selected with empty fields', () => {
    expect(applyDiffSchema.safeParse({ importId: 'i', rowIndex: 1, mode: 'apply-selected', selectedFields: [] }).success).toBe(false)
  })
})

describe('confirmNormalizationSchema', () => {
  it('confirm needs a target institution id; reject does not', () => {
    expect(confirmNormalizationSchema.safeParse({ importId: 'i', rawName: 'X', decision: 'confirm', targetInstitutionId: 'ti_1' }).success).toBe(true)
    expect(confirmNormalizationSchema.safeParse({ importId: 'i', rawName: 'X', decision: 'confirm' }).success).toBe(false)
    expect(confirmNormalizationSchema.safeParse({ importId: 'i', rawName: 'X', decision: 'reject' }).success).toBe(true)
  })
})

describe('finalizeImportSchema', () => {
  it('requires importId', () => {
    expect(finalizeImportSchema.safeParse({}).success).toBe(false)
    expect(finalizeImportSchema.safeParse({ importId: 'imp_1' }).success).toBe(true)
  })
})
