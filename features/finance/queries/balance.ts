import { prisma } from '@/lib/prisma'
import { computePaymentStatus, type PaymentStatus } from '@/features/finance/services/payment-calculator'

export type Balance = { invoicedMinor: number; paidMinor: number; balanceMinor: number; currency: string; status: PaymentStatus }

export async function getInstitutionBalance(tournamentInstitutionId: string): Promise<Balance> {
  const invoice = await prisma.invoice.findUnique({
    where: { tournamentInstitutionId },
    select: { id: true, totalMinor: true, currency: true },
  })
  if (!invoice) return { invoicedMinor: 0, paidMinor: 0, balanceMinor: 0, currency: 'PHP', status: 'PAID' }
  const paidAgg = await prisma.paymentReceipt.aggregate({
    where: { invoiceId: invoice.id, status: 'APPROVED' },
    _sum: { amountMinor: true },
  })
  const paidMinor = paidAgg._sum.amountMinor ?? 0
  const status = computePaymentStatus({ totalMinor: invoice.totalMinor, paidMinor })
  return {
    invoicedMinor: invoice.totalMinor, paidMinor,
    balanceMinor: invoice.totalMinor - paidMinor,
    currency: invoice.currency, status,
  }
}

export async function getPaymentStatus(tournamentInstitutionId: string): Promise<PaymentStatus> {
  return (await getInstitutionBalance(tournamentInstitutionId)).status
}
