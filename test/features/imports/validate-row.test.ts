import { describe, it, expect } from 'vitest'
import { validateRow } from '@/features/imports/services/validate-row'
import type { ParsedRow } from '@/features/imports/types'

const base = (): ParsedRow => ({
  rowIndex: 1,
  raw: {},
  registrationType: 'institution',
  institutionName: 'SKSU',
  representative: { name: 'X', email: 'x@y.com', phone: null },
  teamsIntended: null,
  adjudicatorsIntended: null,
  logicalTeams: [{
    teamName: 'Alpha', isNovice: false, slotIndex: 1,
    debaters: [
      { name: 'A', email: 'a@x.com', phone: null, institution: null, slotIndex: 1 },
      { name: 'B', email: 'b@x.com', phone: null, institution: null, slotIndex: 2 },
      { name: 'C', email: 'c@x.com', phone: null, institution: null, slotIndex: 3 },
    ],
  }],
  judges: [{ name: 'J', email: 'j@x.com', phone: null, institution: null }],
})

describe('validateRow', () => {
  it('passes a clean phase-2 row', () => {
    const issues = validateRow(base(), 'phase-2', 3)
    expect(issues).toEqual([])
  })

  it('errors on missing registration_type', () => {
    const r = base(); r.registrationType = null
    const issues = validateRow(r, 'phase-2', 3)
    expect(issues).toContainEqual(expect.objectContaining({ kind: 'error', field: 'registration_type' }))
  })

  it('errors on missing team_name for institution row in phase-2', () => {
    const r = base(); r.logicalTeams[0].teamName = null
    const issues = validateRow(r, 'phase-2', 3)
    expect(issues).toContainEqual(expect.objectContaining({ kind: 'error', field: 'team_name' }))
  })

  it('warns when team has fewer debaters than speakerCount', () => {
    const r = base(); r.logicalTeams[0].debaters = r.logicalTeams[0].debaters.slice(0, 2)
    const issues = validateRow(r, 'phase-2', 3)
    expect(issues).toContainEqual(expect.objectContaining({ kind: 'warning', field: 'debaters' }))
  })

  it('warns when judge_name is missing or N/A', () => {
    const r = base(); r.judges = [{ name: 'N/A', email: null, phone: null, institution: null }]
    const issues = validateRow(r, 'phase-2', 3)
    expect(issues).toContainEqual(expect.objectContaining({ kind: 'warning', field: 'judge_name' }))
  })

  it('errors on invalid email format', () => {
    const r = base(); r.logicalTeams[0].debaters[0].email = 'not-an-email'
    const issues = validateRow(r, 'phase-2', 3)
    expect(issues).toContainEqual(expect.objectContaining({ kind: 'error', field: 'debater_email' }))
  })

  it('warns when teams_intended is non-numeric in phase-1', () => {
    const r = base(); r.registrationType = 'institution'; r.teamsIntended = null; r.logicalTeams = []
    r.raw = { teams_intended: '3 teams' }
    const issues = validateRow(r, 'phase-1', 3)
    expect(issues).toContainEqual(expect.objectContaining({ kind: 'warning', field: 'teams_intended' }))
  })
})
