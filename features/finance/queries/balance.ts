import { readBalances, type BalanceRow } from '../repositories/balances'
import { computePaymentStatus, type PaymentStatus } from '../services/payment-calculator'
import { databaseInteger } from '@/lib/database-number'
export type Balance = {
  invoicedMinor: number
  paidMinor: number
  balanceMinor: number
  currency: string
  status: PaymentStatus
}

export async function getInstitutionBalance(institutionId: string): Promise<Balance> {
  return (
    toBalances(await readBalances({ institutionId })).get(institutionId) ?? {
      invoicedMinor: 0,
      paidMinor: 0,
      balanceMinor: 0,
      currency: 'PHP',
      status: 'PAID',
    }
  )
}
export async function getInstitutionBalancesForTournament(
  tournamentId: string,
  institutionIds?: string[],
): Promise<Map<string, Balance>> {
  return toBalances(await readBalances({ tournamentId, institutionIds }))
}

function toBalances(rows: BalanceRow[]): Map<string, Balance> {
  return new Map(
    rows.map((row) => {
      const paidMinor = databaseInteger(row.paid, 'Approved receipt balance')
      return [
        row.institutionId,
        {
          invoicedMinor: row.total,
          paidMinor,
          balanceMinor: row.total - paidMinor,
          currency: row.currency,
          status: computePaymentStatus({ totalMinor: row.total, paidMinor }),
        },
      ]
    }),
  )
}
export async function getPaymentStatus(institutionId: string) {
  return (await getInstitutionBalance(institutionId)).status
}
