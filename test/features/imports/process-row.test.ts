import { describe, it, expect } from 'vitest'
import { applyMapping } from '@/features/imports/services/process-row'
import type { MappingSpec } from '@/features/imports/types'

const mapping: MappingSpec = {
  entries: [
    { header: 'Type', field: 'registration_type' },
    { header: 'Institution', field: 'institution_name' },
    { header: 'Rep', field: 'representative_name' },
    { header: 'Rep Email', field: 'representative_email' },
    { header: 'Team Name', field: 'team_name', repeatGroup: 'teams' },
    { header: 'Novice', field: 'team_novice', repeatGroup: 'teams' },
    { header: 'Debater 1', field: 'debater_name', slotIndex: 1, repeatGroup: 'teams' },
    { header: 'Debater 2', field: 'debater_name', slotIndex: 2, repeatGroup: 'teams' },
    { header: 'Judge', field: 'judge_name' },
    { header: 'Team Name 2', field: 'team_name', repeatGroup: 'teams' },
    { header: 'Novice 2', field: 'team_novice', repeatGroup: 'teams' },
    { header: 'Debater 1 2', field: 'debater_name', slotIndex: 1, repeatGroup: 'teams' },
    { header: 'Debater 2 2', field: 'debater_name', slotIndex: 2, repeatGroup: 'teams' },
    { header: 'Ignore Me', field: 'ignore' },
  ],
  repeatGroups: [{ name: 'teams', repetitions: 2 }],
}

describe('applyMapping', () => {
  it('parses an Institution row with two teams', () => {
    const raw = {
      Type: 'Institution', Institution: 'SKSU', Rep: 'A', 'Rep Email': 'a@x.com',
      'Team Name': 'Alpha', Novice: 'Yes', 'Debater 1': 'D1', 'Debater 2': 'D2',
      Judge: 'J1',
      'Team Name 2': 'Beta', 'Novice 2': 'No', 'Debater 1 2': 'D3', 'Debater 2 2': 'D4',
      'Ignore Me': 'consent',
    }
    const parsed = applyMapping(raw, mapping, 0)
    expect(parsed.registrationType).toBe('institution')
    expect(parsed.institutionName).toBe('SKSU')
    expect(parsed.logicalTeams).toHaveLength(2)
    expect(parsed.logicalTeams[0].teamName).toBe('Alpha')
    expect(parsed.logicalTeams[0].isNovice).toBe(true)
    expect(parsed.logicalTeams[1].teamName).toBe('Beta')
    expect(parsed.logicalTeams[1].isNovice).toBe(false)
  })

  it('skips empty repeat slots', () => {
    const raw = { Type: 'Institution', Institution: 'X', 'Team Name': 'Alpha', 'Team Name 2': '', 'Debater 1': 'D1' } as Record<string, string>
    const parsed = applyMapping(raw, mapping, 0)
    expect(parsed.logicalTeams).toHaveLength(1)
  })

  it('routes composite by lower-casing type', () => {
    const raw = { Type: 'COMPOSITE', Institution: 'X' } as Record<string, string>
    const parsed = applyMapping(raw, mapping, 0)
    expect(parsed.registrationType).toBe('composite')
  })

  it('routes independent adjudicator', () => {
    const raw = { Type: 'Independent Adjudicator', Judge: 'J' } as Record<string, string>
    const parsed = applyMapping(raw, mapping, 0)
    expect(parsed.registrationType).toBe('independent_adjudicator')
  })

  it('returns null registrationType for unknown value', () => {
    const raw = { Type: 'Something', Institution: 'X' } as Record<string, string>
    const parsed = applyMapping(raw, mapping, 0)
    expect(parsed.registrationType).toBeNull()
  })
})
