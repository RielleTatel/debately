import { Suspense } from 'react'
import Link from 'next/link'
import { requireTournamentReadable } from '@/features/tournaments/permissions'
import { QuickActions } from '@/features/dashboards/components/quick-actions'
import { StatusPanel } from '@/features/dashboards/components/tournament-dashboard/status-panel'
import { SummaryStrip } from '@/features/dashboards/components/tournament-dashboard/summary-strip'
import { ActivityPanel } from '@/features/dashboards/components/tournament-dashboard/activity-panel'
import {
  StatusIndicatorsSkeleton,
  SummaryCardsSkeleton,
  RecentActivitySkeleton,
} from '@/features/dashboards/components/tournament-dashboard/skeletons'

export default async function OrganizerDashboardPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  const { tournament, isDirector } = await requireTournamentReadable(tournamentId)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{tournament.name}</h1>
          <p className="text-sm text-muted-foreground">
            {tournament.venue} · {tournament.startDate.toDateString()}
          </p>
        </div>
        <Link href={`/tournaments/${tournamentId}/settings`} className="text-sm text-primary hover:underline">
          Settings
        </Link>
      </div>

      <Suspense fallback={<StatusIndicatorsSkeleton />}>
        <StatusPanel tournamentId={tournamentId} tournament={tournament} />
      </Suspense>

      <Suspense fallback={<SummaryCardsSkeleton />}>
        <SummaryStrip tournamentId={tournamentId} currency={tournament.currency} />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-3">Recent activity</h2>
          <Suspense fallback={<RecentActivitySkeleton />}>
            <ActivityPanel tournamentId={tournamentId} />
          </Suspense>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick actions</h2>
          <QuickActions tournamentId={tournamentId} isDirector={isDirector} />
        </div>
      </div>
    </div>
  )
}
