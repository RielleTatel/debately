import { Suspense } from 'react'
import { requireTournamentReadable } from '@/features/tournaments/permissions'
import {
  FinanceOverviewPanel,
  FinanceOverviewSkeleton,
} from '@/features/finance/components/finance-overview-panel'

export default async function FinancePage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  await requireTournamentReadable(tournamentId)
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Finance overview</h1>
      <Suspense fallback={<FinanceOverviewSkeleton />}>
        <FinanceOverviewPanel tournamentId={tournamentId} />
      </Suspense>
    </div>
  )
}
