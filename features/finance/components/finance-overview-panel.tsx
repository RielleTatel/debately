import { prisma } from '@/lib/prisma'
import { readPage, type SearchParams } from '@/lib/pagination'
import { PageNavigation } from '@/components/ui/page-navigation'
import { getInstitutionBalancesForTournament } from '@/features/finance/queries/balance'
import { getPaymentTotalsForTournament } from '@/features/finance/queries/payments'
import { FinanceOverviewTable } from '@/features/finance/components/finance-overview-table'
import { RosterSkeleton } from '@/components/ui/roster-skeleton'
import { getFinanceInstitutionCount } from '@/features/finance/queries/institution-count'

export async function FinanceOverviewPanel({
  tournamentId,
  search = {},
}: {
  tournamentId: string
  search?: SearchParams
}) {
  const paging = readPage(search)
  const [institutions, total] = await Promise.all([
    prisma.tournamentInstitution.findMany({
      where: { tournamentId },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: paging.pageSize,
      skip: paging.skip,
      select: { id: true, name: true },
    }),
    getFinanceInstitutionCount(tournamentId),
  ])
  const ids = institutions.map((i) => i.id)
  const [balanceMap, paymentTotals] = await Promise.all([
    getInstitutionBalancesForTournament(tournamentId, ids),
    getPaymentTotalsForTournament(tournamentId, ids),
  ])
  const rows = institutions.map((i) => ({
    institutionId: i.id,
    institutionName: i.name,
    balance: balanceMap.get(i.id) ?? null,
    declaredPaid: paymentTotals.get(i.id) ?? null,
  }))
  return (
    <div className="space-y-2">
      <FinanceOverviewTable rows={rows} />
      <PageNavigation
        pathname={`/tournaments/${tournamentId}/finance`}
        params={search}
        paging={paging}
        total={total}
      />
    </div>
  )
}

export function FinanceOverviewSkeleton({ rows = 50 }: { rows?: number }) {
  return <RosterSkeleton kind="finance" rows={rows} />
}
