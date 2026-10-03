import { Suspense } from 'react'
import { pageRowCount, readPage, type SearchParams } from '@/lib/pagination'
import { getFinanceInstitutionCount } from '@/features/finance/queries/institution-count'
import { requireTournamentReadable } from '@/features/tournaments/permissions'
import {
  FinanceOverviewPanel,
  FinanceOverviewSkeleton,
} from '@/features/finance/components/finance-overview-panel'

export default async function FinancePage({
  params,
  searchParams,
}: {
  params: Promise<{ tournamentId: string }>
  searchParams: Promise<SearchParams>
}) {
  const { tournamentId } = await params
  await requireTournamentReadable(tournamentId)
  const search = await searchParams
  const rows = pageRowCount(await getFinanceInstitutionCount(tournamentId), readPage(search))
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Finance overview</h1>
      <Suspense fallback={<FinanceOverviewSkeleton rows={rows} />}>
        <FinanceOverviewPanel tournamentId={tournamentId} search={search} />
      </Suspense>
    </div>
  )
}
