import { prisma } from '@/lib/prisma'
import { databaseInteger } from '@/lib/database-number'

type Aggregate = {
  currency: string
  invoiced: bigint
  paid: bigint
  unpaid: bigint
  partial: bigint
  settled: bigint
  overpaid: bigint
}
export async function readFinancialAnalytics(tournamentId: string) {
  const [groups, tournament] = await Promise.all([
    prisma.$queryRaw<Aggregate[]>`
      WITH invoice_paid AS (
        SELECT v.id, v.currency, v.total_minor, COALESCE(SUM(r.amount_minor) FILTER (WHERE r.status='APPROVED'),0)::bigint AS paid
        FROM invoices v JOIN tournament_institutions i ON i.id=v.tournament_institution_id
        LEFT JOIN payment_receipts r ON r.invoice_id=v.id WHERE i.tournament_id=${tournamentId}
        GROUP BY v.id
      ), classified AS (
        SELECT *, CASE WHEN total_minor=0 OR paid=total_minor THEN 'PAID' WHEN paid=0 THEN 'UNPAID' WHEN paid>total_minor THEN 'OVERPAID' ELSE 'PARTIAL' END AS status FROM invoice_paid
      )
      SELECT currency, SUM(total_minor)::bigint AS invoiced, SUM(paid)::bigint AS paid,
        COUNT(*) FILTER (WHERE status='UNPAID') AS unpaid, COUNT(*) FILTER (WHERE status='PARTIAL') AS partial,
        COUNT(*) FILTER (WHERE status='PAID') AS settled, COUNT(*) FILTER (WHERE status='OVERPAID') AS overpaid
      FROM classified GROUP BY currency ORDER BY currency
    `,
    prisma.tournament.findUnique({ where: { id: tournamentId }, select: { currency: true } }),
  ])
  const byCurrency = groups.map((row) => {
    const totalInvoicedMinor = databaseInteger(row.invoiced, 'Invoice total')
    const totalPaidMinor = databaseInteger(row.paid, 'Approved receipt total')
    return {
      currency: row.currency,
      totalInvoicedMinor,
      totalPaidMinor,
      outstandingMinor: Math.max(0, totalInvoicedMinor - totalPaidMinor),
      completionRate: totalInvoicedMinor === 0 ? 1 : totalPaidMinor / totalInvoicedMinor,
      statusCount: {
        UNPAID: databaseInteger(row.unpaid, 'Unpaid invoices'),
        PARTIAL: databaseInteger(row.partial, 'Partial invoices'),
        PAID: databaseInteger(row.settled, 'Paid invoices'),
        OVERPAID: databaseInteger(row.overpaid, 'Overpaid invoices'),
      },
    }
  })
  const currency = tournament?.currency ?? 'PHP'
  const primary = byCurrency.find((row) => row.currency === currency) ?? {
    currency,
    totalInvoicedMinor: 0,
    totalPaidMinor: 0,
    outstandingMinor: 0,
    completionRate: 1,
    statusCount: { UNPAID: 0, PARTIAL: 0, PAID: 0, OVERPAID: 0 },
  }
  return { ...primary, byCurrency: byCurrency.length ? byCurrency : [primary] }
}
