import { describe, it, expect } from 'vitest'
import { parseCsvHeaders, parseCsvRows } from '@/features/imports/services/csv-parser'

const csv = 'Institution,Team Name,"Debater 1"\nSKSU,Alpha,Yryll\nSKSU,Beta,Anne\n'

describe('parseCsvHeaders', () => {
  it('returns trimmed header list', () => {
    expect(parseCsvHeaders(csv)).toEqual(['Institution', 'Team Name', 'Debater 1'])
  })
  it('returns empty array on empty input', () => {
    expect(parseCsvHeaders('')).toEqual([])
  })
})

describe('parseCsvRows', () => {
  it('returns headers + object rows', () => {
    const r = parseCsvRows(csv)
    expect(r.headers).toEqual(['Institution', 'Team Name', 'Debater 1'])
    expect(r.rows).toHaveLength(2)
    expect(r.rows[0]).toEqual({ Institution: 'SKSU', 'Team Name': 'Alpha', 'Debater 1': 'Yryll' })
  })
  it('handles quoted commas and BOM', () => {
    const withBom = '\uFEFFa,b\n"1,2","3"\n'
    const r = parseCsvRows(withBom)
    expect(r.headers).toEqual(['a', 'b'])
    expect(r.rows[0]).toEqual({ a: '1,2', b: '3' })
  })
})
