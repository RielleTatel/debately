import { getInstitutionsForTournament } from '@/features/institutions/queries'
import { getInstitutionBalancesForTournament } from '@/features/finance/queries/balance'
import { getPaymentTotalsForTournament } from '@/features/finance/queries/payments'
import { FinanceOverviewTable } from '@/features/finance/components/finance-overview-table'

export async function FinanceOverviewPanel({ tournamentId }: { tournamentId: string }) {
  const [institutions, balanceMap, paymentTotals] = await Promise.all([
    getInstitutionsForTournament(tournamentId),
    getInstitutionBalancesForTournament(tournamentId),
    getPaymentTotalsForTournament(tournamentId),
  ])
  const rows = institutions.map((i) => ({
    institutionId: i.id,
    institutionName: i.name,
    balance: balanceMap.get(i.id) ?? null,
    declaredPaid: paymentTotals.get(i.id) ?? null,
  }))
  return <FinanceOverviewTable rows={rows} />
}

export function FinanceOverviewSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded bg-muted h-10 w-full" />
      ))}
    </div>
  )
}
