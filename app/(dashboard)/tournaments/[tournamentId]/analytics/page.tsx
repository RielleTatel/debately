import { Suspense } from 'react'
import { requireTournamentDirector } from '@/features/tournaments/permissions'
import { RegistrationAnalyticsPanel } from '@/features/dashboards/components/tournament-analytics/registration-panel'
import { FinancialAnalyticsPanel } from '@/features/dashboards/components/tournament-analytics/financial-panel'
import { ImportAnalyticsPanel } from '@/features/dashboards/components/tournament-analytics/import-panel'
import { RequestAnalyticsPanel } from '@/features/dashboards/components/tournament-analytics/request-panel'
import { ChartSectionSkeleton } from '@/features/dashboards/components/tournament-analytics/skeletons'

export default async function AnalyticsPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  await requireTournamentDirector(tournamentId)

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <section>
        <h2 className="text-lg font-medium mb-3">Registration</h2>
        <Suspense fallback={<ChartSectionSkeleton />}>
          <RegistrationAnalyticsPanel tournamentId={tournamentId} />
        </Suspense>
      </section>
      <section>
        <h2 className="text-lg font-medium mb-3">Financial</h2>
        <Suspense fallback={<ChartSectionSkeleton />}>
          <FinancialAnalyticsPanel tournamentId={tournamentId} />
        </Suspense>
      </section>
      <section>
        <h2 className="text-lg font-medium mb-3">Imports</h2>
        <Suspense fallback={<ChartSectionSkeleton />}>
          <ImportAnalyticsPanel tournamentId={tournamentId} />
        </Suspense>
      </section>
      <section>
        <h2 className="text-lg font-medium mb-3">Requests</h2>
        <Suspense fallback={<ChartSectionSkeleton />}>
          <RequestAnalyticsPanel tournamentId={tournamentId} />
        </Suspense>
      </section>
    </div>
  )
}
