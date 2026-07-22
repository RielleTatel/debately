import { prisma } from '@/lib/prisma'
import { csvStream } from '../stream'
import { formatAmount } from '@/lib/money'

export function streamPaymentsCsv(tournamentId: string) {
  async function* rows() {
    const list = await prisma.invoice.findMany({
      where: { institution: { tournamentId } },
      include: {
        institution: { select: { name: true } },
        receipts: { where: { status: 'APPROVED' }, select: { amountMinor: true } },
      },
      orderBy: { invoiceNumber: 'asc' },
    })
    for (const inv of list) {
      const paid = inv.receipts.reduce((a, r) => a + r.amountMinor, 0)
      yield { ...inv, paidMinor: paid }
    }
  }
  return csvStream(
    rows(),
    ['invoiceNumber', 'institution', 'subtotal', 'discount', 'total', 'paid', 'currency'],
    (i) => [
      i.invoiceNumber,
      i.institution.name,
      formatAmount(i.subtotalMinor, i.currency),
      formatAmount(i.discountMinor, i.currency),
      formatAmount(i.totalMinor, i.currency),
      formatAmount(i.paidMinor, i.currency),
      i.currency,
    ],
  )
}
