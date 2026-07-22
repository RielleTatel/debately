import { prisma } from '@/lib/prisma'

export async function getRegistrationAnalytics(tournamentId: string) {
  const institutions = await prisma.tournamentInstitution.findMany({ where: { tournamentId }, select: { id: true, createdAt: true } })
  const teams = await prisma.team.findMany({ where: { institution: { tournamentId } }, select: { createdAt: true } })
  const adjudicators = await prisma.adjudicator.findMany({ where: { institution: { tournamentId } }, select: { createdAt: true } })
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId }, select: { maxTeamSlots: true, registrationDeadline: true } })
  const claimedIds = new Set((await prisma.institutionClaim.findMany({ where: { institution: { tournamentId } }, select: { tournamentInstitutionId: true } })).map((c) => c.tournamentInstitutionId))

  const byDay = new Map<string, { teams: number; adjudicators: number }>()
  for (const t of teams) { const d = t.createdAt.toISOString().slice(0, 10); const b = byDay.get(d) ?? { teams: 0, adjudicators: 0 }; b.teams += 1; byDay.set(d, b) }
  for (const a of adjudicators) { const d = a.createdAt.toISOString().slice(0, 10); const b = byDay.get(d) ?? { teams: 0, adjudicators: 0 }; b.adjudicators += 1; byDay.set(d, b) }
  const sortedDays = Array.from(byDay.keys()).sort()
  const series: Array<{ date: string; teamsCumulative: number; adjudicatorsCumulative: number }> = []
  let cumT = 0, cumA = 0
  for (const d of sortedDays) { const v = byDay.get(d)!; cumT += v.teams; cumA += v.adjudicators; series.push({ date: d, teamsCumulative: cumT, adjudicatorsCumulative: cumA }) }

  return {
    series, capacity: { totalSlots: tournament?.maxTeamSlots ?? 0, filled: teams.length, deadline: tournament?.registrationDeadline ?? null },
    claimBreakdown: { claimed: institutions.filter((i) => claimedIds.has(i.id)).length, unclaimed: institutions.filter((i) => !claimedIds.has(i.id)).length },
    counts: { institutions: institutions.length, teams: teams.length, adjudicators: adjudicators.length },
  }
}
