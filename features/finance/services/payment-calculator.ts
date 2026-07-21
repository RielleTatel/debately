export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERPAID'

export function computePaymentStatus(input: { totalMinor: number; paidMinor: number }): PaymentStatus {
  const { totalMinor, paidMinor } = input
  if (paidMinor === 0 && totalMinor > 0) return 'UNPAID'
  if (paidMinor > totalMinor) return 'OVERPAID'
  if (paidMinor === totalMinor) return 'PAID'
  return 'PARTIAL'
}
