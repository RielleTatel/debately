import { prisma } from '@/lib/prisma'

export async function getFinancialAnalytics(tournamentId: string) {
  const invoices = await prisma.invoice.findMany({ where: { institution: { tournamentId } }, include: { receipts: { where: { status: 'APPROVED' }, select: { amountMinor: true } } } })
  let totalInvoiced = 0, totalPaid = 0
  const statusCount = { UNPAID: 0, PARTIAL: 0, PAID: 0, OVERPAID: 0 }
  for (const inv of invoices) {
    totalInvoiced += inv.totalMinor; const paid = inv.receipts.reduce((a, r) => a + r.amountMinor, 0); totalPaid += paid
    if (inv.totalMinor === 0 || paid === inv.totalMinor) statusCount.PAID += 1
    else if (paid === 0) statusCount.UNPAID += 1
    else if (paid > inv.totalMinor) statusCount.OVERPAID += 1
    else statusCount.PARTIAL += 1
  }
  return { totalInvoicedMinor: totalInvoiced, totalPaidMinor: totalPaid, outstandingMinor: Math.max(0, totalInvoiced - totalPaid), completionRate: totalInvoiced === 0 ? 1 : totalPaid / totalInvoiced, statusCount }
}
