import { prisma } from '@/lib/prisma'

export type RegistrationFlag = {
  kind:
    | 'JUDGE_DEFICIT'
    | 'DUPLICATE_EMAIL'
    | 'MULTI_TEAM_SPEAKER'
    | 'OVER_TOURNAMENT_CAP'
    | 'OVER_INSTITUTION_CAP'
  severity: 'warning' | 'error'
  institutionId?: string
  institutionName?: string
  message: string
  data?: Record<string, unknown>
}

export async function validateRegistrations(tournamentId: string): Promise<RegistrationFlag[]> {
  const flags: RegistrationFlag[] = []

  const [tournament, institutions, participants] = await Promise.all([
    prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        maxTeamSlots: true,
        maxTeamsPerInstitution: true,
        judgeRule: true,
        ghostJudgeFee: true,
      },
    }),
    prisma.tournamentInstitution.findMany({
      where: { tournamentId },
      select: {
        id: true,
        name: true,
        _count: { select: { teams: true, adjudicators: true } },
      },
    }),
    prisma.participant.findMany({
      where: { institution: { tournamentId } },
      select: {
        id: true,
        email: true,
        displayName: true,
        teamId: true,
        tournamentInstitutionId: true,
      },
    }),
  ])

  if (!tournament) return flags

  // Total teams across tournament
  const totalTeams = institutions.reduce((sum, i) => sum + i._count.teams, 0)
  if (totalTeams > tournament.maxTeamSlots) {
    flags.push({
      kind: 'OVER_TOURNAMENT_CAP',
      severity: 'error',
      message: `Tournament has ${totalTeams} teams registered but the cap is ${tournament.maxTeamSlots}.`,
      data: { totalTeams, cap: tournament.maxTeamSlots },
    })
  }

  for (const inst of institutions) {
    const teams = inst._count.teams
    const adjs = inst._count.adjudicators

    // Per-institution team cap
    if (tournament.maxTeamsPerInstitution && teams > tournament.maxTeamsPerInstitution) {
      flags.push({
        kind: 'OVER_INSTITUTION_CAP',
        severity: 'warning',
        institutionId: inst.id,
        institutionName: inst.name,
        message: `${inst.name} has ${teams} teams (cap: ${tournament.maxTeamsPerInstitution}).`,
        data: { teams, cap: tournament.maxTeamsPerInstitution },
      })
    }

    // Judge rule
    if (tournament.judgeRule && teams > 0) {
      const required = teams * tournament.judgeRule
      const deficit = required - adjs
      if (deficit > 0) {
        const fee = tournament.ghostJudgeFee != null ? deficit * tournament.ghostJudgeFee : null
        flags.push({
          kind: 'JUDGE_DEFICIT',
          severity: 'warning',
          institutionId: inst.id,
          institutionName: inst.name,
          message: [
            `${inst.name} needs ${required} judge${required !== 1 ? 's' : ''} (${teams} team${teams !== 1 ? 's' : ''} × ${tournament.judgeRule}) but has ${adjs}.`,
            fee != null ? `Ghost judge fee: ${fee.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : '',
          ].filter(Boolean).join(' '),
          data: { teams, required, actual: adjs, deficit, ghostJudgeFee: fee },
        })
      }
    }
  }

  // Duplicate emails (speakers with same email across the tournament)
  const emailCounts = new Map<string, string[]>()
  for (const p of participants) {
    if (!p.email) continue
    const existing = emailCounts.get(p.email) ?? []
    existing.push(p.id)
    emailCounts.set(p.email, existing)
  }
  for (const [email, ids] of emailCounts) {
    if (ids.length > 1) {
      flags.push({
        kind: 'DUPLICATE_EMAIL',
        severity: 'warning',
        message: `Email "${email}" appears in ${ids.length} participant records.`,
        data: { email, count: ids.length },
      })
    }
  }

  // Speaker in multiple teams
  const teamsByParticipant = new Map<string, Set<string>>()
  for (const p of participants) {
    if (!p.teamId) continue
    const key = p.email ?? p.id
    const teams = teamsByParticipant.get(key) ?? new Set()
    teams.add(p.teamId)
    teamsByParticipant.set(key, teams)
  }
  for (const p of participants) {
    const key = p.email ?? p.id
    const teams = teamsByParticipant.get(key)
    if (teams && teams.size > 1) {
      flags.push({
        kind: 'MULTI_TEAM_SPEAKER',
        severity: 'error',
        message: `"${p.displayName}"${p.email ? ` (${p.email})` : ''} appears in ${teams.size} teams.`,
        data: { participantId: p.id, teamCount: teams.size },
      })
      // Remove to avoid duplicate flags for same person
      teamsByParticipant.delete(key)
    }
  }

  return flags
}
