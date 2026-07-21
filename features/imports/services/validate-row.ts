import type { ParsedRow, RowIssue } from '@/features/imports/types'

export type ImportPhase = 'phase-1' | 'phase-2' | 'phase-3'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function nAOrEmpty(v: string | null | undefined): boolean {
  if (!v) return true
  return v.trim().toLowerCase() === 'n/a' || v.trim() === ''
}

export function validateRow(row: ParsedRow, phase: ImportPhase, speakerCount: number): RowIssue[] {
  const issues: RowIssue[] = []

  if (!row.registrationType) {
    issues.push({ kind: 'error', field: 'registration_type', message: 'Missing registration_type' })
    return issues
  }

  if (!row.institutionName && row.registrationType !== 'independent_adjudicator') {
    issues.push({ kind: 'error', field: 'institution_name', message: 'Missing institution_name' })
  }

  if (phase === 'phase-1') {
    const raw = row.raw['teams_intended']
    if (raw && Number.isNaN(Number(raw))) {
      issues.push({ kind: 'warning', field: 'teams_intended', message: `Non-numeric teams_intended: "${raw}"` })
    }
    const rawAdj = row.raw['adjudicators_intended']
    if (rawAdj && Number.isNaN(Number(rawAdj))) {
      issues.push({ kind: 'warning', field: 'adjudicators_intended', message: `Non-numeric adjudicators_intended: "${rawAdj}"` })
    }
    return issues
  }

  if (row.registrationType !== 'independent_adjudicator') {
    for (const team of row.logicalTeams) {
      if (!team.teamName) {
        issues.push({ kind: 'error', field: 'team_name', message: `Missing team_name (slot ${team.slotIndex})` })
      }
      const named = team.debaters.filter((d) => d.name)
      if (named.length === 0) {
        issues.push({ kind: 'error', field: 'debaters', message: `No debaters listed for team ${team.teamName ?? team.slotIndex}` })
      } else if (named.length < speakerCount) {
        issues.push({ kind: 'warning', field: 'debaters', message: `Team ${team.teamName ?? team.slotIndex} has ${named.length}/${speakerCount} debaters` })
      }
      for (const d of team.debaters) {
        if (d.email && !EMAIL_RE.test(d.email)) {
          issues.push({ kind: 'error', field: 'debater_email', message: `Invalid email "${d.email}" for debater ${d.name ?? d.slotIndex}` })
        }
      }
    }
  }

  for (const j of row.judges) {
    if (nAOrEmpty(j.name)) {
      issues.push({ kind: 'warning', field: 'judge_name', message: 'Missing accompanying judge' })
    }
    if (j.email && !EMAIL_RE.test(j.email)) {
      issues.push({ kind: 'error', field: 'judge_email', message: `Invalid judge email "${j.email}"` })
    }
  }

  return issues
}
