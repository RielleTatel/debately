import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
export type BalanceRow = { institutionId: string; total: number; paid: bigint; currency: string }
export async function readBalances(
  scope: { institutionId: string } | { tournamentId: string; institutionIds?: string[] },
): Promise<BalanceRow[]> {
  if ('institutionIds' in scope && scope.institutionIds?.length === 0) return []
  const filter =
    'institutionId' in scope
      ? Prisma.sql`i.id=${scope.institutionId}`
      : Prisma.sql`i.tournament_id=${scope.tournamentId} ${scope.institutionIds ? Prisma.sql`AND i.id IN (${Prisma.join(scope.institutionIds)})` : Prisma.empty}`
  return prisma.$queryRaw<BalanceRow[]>(Prisma.sql`
    SELECT i.id AS "institutionId", v.total_minor AS total, v.currency,
      COALESCE(SUM(r.amount_minor) FILTER (WHERE r.status='APPROVED'),0)::bigint AS paid
    FROM invoices v JOIN tournament_institutions i ON i.id=v.tournament_institution_id
    LEFT JOIN payment_receipts r ON r.invoice_id=v.id WHERE ${filter} GROUP BY i.id,v.id
  `)
}
