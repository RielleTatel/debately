import { prisma } from '@/lib/prisma'
import { computePaymentStatus, type PaymentStatus } from '@/features/finance/services/payment-calculator'

export type Balance = { invoicedMinor: number; paidMinor: number; balanceMinor: number; currency: string; status: PaymentStatus }

export async function getInstitutionBalance(tournamentInstitutionId: string): Promise<Balance> {
  const invoice = await prisma.invoice.findUnique({
    where: { tournamentInstitutionId },
    select: {
      id: true,
      totalMinor: true,
      currency: true,
      receipts: { where: { status: 'APPROVED' }, select: { amountMinor: true } },
    },
  })
  if (!invoice) return { invoicedMinor: 0, paidMinor: 0, balanceMinor: 0, currency: 'PHP', status: 'PAID' }
  const paidMinor = invoice.receipts.reduce((a, r) => a + r.amountMinor, 0)
  const status = computePaymentStatus({ totalMinor: invoice.totalMinor, paidMinor })
  return {
    invoicedMinor: invoice.totalMinor, paidMinor,
    balanceMinor: invoice.totalMinor - paidMinor,
    currency: invoice.currency, status,
  }
}

export async function getInstitutionBalancesForTournament(
  tournamentId: string,
): Promise<Map<string, Balance>> {
  const invoices = await prisma.invoice.findMany({
    where: { institution: { tournamentId } },
    select: {
      tournamentInstitutionId: true,
      totalMinor: true,
      currency: true,
      receipts: { where: { status: 'APPROVED' }, select: { amountMinor: true } },
    },
  })
  const out = new Map<string, Balance>()
  for (const inv of invoices) {
    const paidMinor = inv.receipts.reduce((a, r) => a + r.amountMinor, 0)
    out.set(inv.tournamentInstitutionId, {
      invoicedMinor: inv.totalMinor,
      paidMinor,
      balanceMinor: inv.totalMinor - paidMinor,
      currency: inv.currency,
      status: computePaymentStatus({ totalMinor: inv.totalMinor, paidMinor }),
    })
  }
  return out
}

export async function getPaymentStatus(tournamentInstitutionId: string): Promise<PaymentStatus> {
  return (await getInstitutionBalance(tournamentInstitutionId)).status
}
