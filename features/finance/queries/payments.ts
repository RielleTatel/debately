import { prisma } from '@/lib/prisma'
import { Prisma, type TournamentPayment } from '@prisma/client'
import { databaseInteger } from '@/lib/database-number'

export async function getPaymentsForInstitution(
  tournamentInstitutionId: string,
): Promise<TournamentPayment[]> {
  return prisma.tournamentPayment.findMany({
    where: { tournamentInstitutionId },
    orderBy: { createdAt: 'asc' },
  })
}

export type DeclaredPaymentTotal = { totalMinor: number; currency: string }
export async function getPaymentTotalsForTournament(
  tournamentId: string,
  institutionIds?: string[],
): Promise<Map<string, DeclaredPaymentTotal[]>> {
  if (institutionIds?.length === 0) return new Map()
  const rows = await prisma.$queryRaw<
    Array<{ institutionId: string; total: bigint; currency: string }>
  >(Prisma.sql`
    SELECT tournament_institution_id AS "institutionId", currency, SUM(amount_minor)::bigint AS total
    FROM tournament_payments WHERE tournament_id=${tournamentId} AND status<>'VOIDED'
      ${institutionIds ? Prisma.sql`AND tournament_institution_id IN (${Prisma.join(institutionIds)})` : Prisma.empty}
    GROUP BY tournament_institution_id,currency ORDER BY tournament_institution_id,currency
  `)
  const result = new Map<string, DeclaredPaymentTotal[]>()
  for (const row of rows) {
    const totals = result.get(row.institutionId) ?? []
    totals.push({
      totalMinor: databaseInteger(row.total, 'Declared payment total'),
      currency: row.currency,
    })
    result.set(row.institutionId, totals)
  }
  return result
}
