import { prisma } from '@/lib/prisma'
import { databaseInteger } from '@/lib/database-number'

export async function readRegistrationSummary(tournamentId: string) {
  const [row] = await prisma.$queryRaw<
    Array<{
      slots: number
      deadline: Date
      institutions: bigint
      teams: bigint
      adjudicators: bigint
      claimed: bigint
    }>
  >`
    SELECT t.max_team_slots AS slots, t.registration_deadline AS deadline,
      (SELECT COUNT(*) FROM tournament_institutions i WHERE i.tournament_id=t.id) AS institutions,
      (SELECT COUNT(*) FROM teams x JOIN tournament_institutions i ON i.id=x.tournament_institution_id WHERE i.tournament_id=t.id) AS teams,
      (SELECT COUNT(*) FROM adjudicators x JOIN tournament_institutions i ON i.id=x.tournament_institution_id WHERE i.tournament_id=t.id) AS adjudicators,
      (SELECT COUNT(*) FROM institution_claims c JOIN tournament_institutions i ON i.id=c.tournament_institution_id WHERE i.tournament_id=t.id) AS claimed
    FROM tournaments t WHERE t.id=${tournamentId}
  `
  const institutions = databaseInteger(row?.institutions ?? null, 'Institution count')
  const teams = databaseInteger(row?.teams ?? null, 'Team count')
  const claimed = databaseInteger(row?.claimed ?? null, 'Claim count')
  return {
    counts: {
      institutions,
      teams,
      adjudicators: databaseInteger(row?.adjudicators ?? null, 'Adjudicator count'),
    },
    capacity: {
      totalSlots: row?.slots ?? 0,
      filled: teams,
      deadline: row?.deadline.toISOString() ?? null,
    },
    claimBreakdown: { claimed, unclaimed: institutions - claimed },
  }
}

export async function readRegistrationSeries(tournamentId: string) {
  const days = await prisma.$queryRaw<Array<{ date: string; teams: bigint; adjudicators: bigint }>>`
    WITH registrations AS (
      SELECT to_char(x.created_at, 'YYYY-MM-DD') AS day, 1 AS teams, 0 AS adjudicators FROM teams x
      JOIN tournament_institutions i ON i.id=x.tournament_institution_id WHERE i.tournament_id=${tournamentId}
      UNION ALL
      SELECT to_char(x.created_at, 'YYYY-MM-DD') AS day, 0 AS teams, 1 AS adjudicators FROM adjudicators x
      JOIN tournament_institutions i ON i.id=x.tournament_institution_id WHERE i.tournament_id=${tournamentId}
    )
    SELECT day AS date, SUM(SUM(teams)) OVER (ORDER BY day)::bigint AS teams,
      SUM(SUM(adjudicators)) OVER (ORDER BY day)::bigint AS adjudicators
    FROM registrations GROUP BY day ORDER BY day
  `
  return days.map((day) => ({
    date: day.date,
    teamsCumulative: databaseInteger(day.teams, 'Cumulative teams'),
    adjudicatorsCumulative: databaseInteger(day.adjudicators, 'Cumulative adjudicators'),
  }))
}
