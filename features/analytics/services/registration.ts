import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function getRegistrationAnalytics(tournamentId: string) {
  const cached = unstable_cache(
    async () => {
      const [institutions, teams, adjudicators, tournament, claimRows] = await Promise.all([
        prisma.tournamentInstitution.findMany({ where: { tournamentId }, select: { id: true, createdAt: true } }),
        prisma.team.findMany({ where: { institution: { tournamentId } }, select: { createdAt: true } }),
        prisma.adjudicator.findMany({ where: { institution: { tournamentId } }, select: { createdAt: true } }),
        prisma.tournament.findUnique({ where: { id: tournamentId }, select: { maxTeamSlots: true, registrationDeadline: true } }),
        prisma.institutionClaim.findMany({ where: { institution: { tournamentId } }, select: { tournamentInstitutionId: true } }),
      ])
      const claimedIds = new Set(claimRows.map((c) => c.tournamentInstitutionId))

      const byDay = new Map<string, { teams: number; adjudicators: number }>()
      for (const t of teams) { const d = new Date(t.createdAt).toISOString().slice(0, 10); const b = byDay.get(d) ?? { teams: 0, adjudicators: 0 }; b.teams += 1; byDay.set(d, b) }
      for (const a of adjudicators) { const d = new Date(a.createdAt).toISOString().slice(0, 10); const b = byDay.get(d) ?? { teams: 0, adjudicators: 0 }; b.adjudicators += 1; byDay.set(d, b) }
      const sortedDays = Array.from(byDay.keys()).sort()
      const series: Array<{ date: string; teamsCumulative: number; adjudicatorsCumulative: number }> = []
      let cumT = 0, cumA = 0
      for (const d of sortedDays) { const v = byDay.get(d)!; cumT += v.teams; cumA += v.adjudicators; series.push({ date: d, teamsCumulative: cumT, adjudicatorsCumulative: cumA }) }

      return {
        series,
        capacity: {
          totalSlots: tournament?.maxTeamSlots ?? 0,
          filled: teams.length,
          deadline: tournament?.registrationDeadline ? tournament.registrationDeadline.toISOString() : null,
        },
        claimBreakdown: { claimed: institutions.filter((i) => claimedIds.has(i.id)).length, unclaimed: institutions.filter((i) => !claimedIds.has(i.id)).length },
        counts: { institutions: institutions.length, teams: teams.length, adjudicators: adjudicators.length },
      }
    },
    ['registration-analytics', tournamentId],
    { revalidate: 60 },
  )
  const raw = await cached()
  return {
    ...raw,
    capacity: {
      ...raw.capacity,
      deadline: raw.capacity.deadline ? new Date(raw.capacity.deadline) : null,
    },
  }
}
