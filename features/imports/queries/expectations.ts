import { prisma } from '@/lib/prisma'

export type ExpectationsRow = {
  institutionId: string
  institutionName: string
  teamsIntended: number | null
  teamsRegistered: number
  adjudicatorsIntended: number | null
  adjudicatorsRegistered: number
  status: 'match' | 'short' | 'over' | 'unknown'
  statusNote: string | null
}

export async function getExpectationsSummary(tournamentId: string): Promise<ExpectationsRow[]> {
  const institutions = await prisma.tournamentInstitution.findMany({
    where: { tournamentId },
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { teams: true, adjudicators: true } },
    },
  })
  return institutions.map((i) => {
    const teamsRegistered = i._count.teams
    const adjRegistered = i._count.adjudicators
    const teamsDelta = i.teamsIntended != null ? teamsRegistered - i.teamsIntended : null
    const adjDelta = i.adjudicatorsIntended != null ? adjRegistered - i.adjudicatorsIntended : null
    let status: ExpectationsRow['status'] = 'match'
    let note: string | null = null
    if (i.teamsIntended == null && i.adjudicatorsIntended == null) {
      status = 'unknown'
    } else if ((teamsDelta ?? 0) < 0 || (adjDelta ?? 0) < 0) {
      status = 'short'
      const parts: string[] = []
      if ((teamsDelta ?? 0) < 0) parts.push(`${Math.abs(teamsDelta!)} team short`)
      if ((adjDelta ?? 0) < 0) parts.push(`${Math.abs(adjDelta!)} adj short`)
      note = parts.join(', ')
    } else if ((teamsDelta ?? 0) > 0 || (adjDelta ?? 0) > 0) {
      status = 'over'
      const parts: string[] = []
      if ((teamsDelta ?? 0) > 0) parts.push(`${teamsDelta} team over`)
      if ((adjDelta ?? 0) > 0) parts.push(`${adjDelta} adj over`)
      note = parts.join(', ')
    }
    return {
      institutionId: i.id,
      institutionName: i.name,
      teamsIntended: i.teamsIntended,
      teamsRegistered,
      adjudicatorsIntended: i.adjudicatorsIntended,
      adjudicatorsRegistered: adjRegistered,
      status,
      statusNote: note,
    }
  })
}
