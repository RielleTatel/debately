import { Suspense } from 'react'
import { requireTournamentReadable } from '@/features/tournaments/permissions'
import { SectionHeader } from '@/components/ui/section-header'
import { QuickActions } from '@/features/dashboards/components/quick-actions'
import { SummaryStrip } from '@/features/dashboards/components/tournament-dashboard/summary-strip'
import { RegistrationHealth } from '@/features/dashboards/components/tournament-dashboard/registration-health'
import { ActivityPanel } from '@/features/dashboards/components/tournament-dashboard/activity-panel'
import { DeadlinesPanel } from '@/features/dashboards/components/tournament-dashboard/deadlines-panel'
import {
  SummaryCardsSkeleton,
  RegistrationHealthSkeleton,
  RecentActivitySkeleton,
  DeadlinesSkeleton,
} from '@/features/dashboards/components/tournament-dashboard/skeletons'

export default async function OrganizerDashboardPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>
}) {
  const { tournamentId } = await params
  const { tournament, isDirector } = await requireTournamentReadable(tournamentId)

  return (
    <div className="space-y-8">
      {/* Registration health */}
      <section className="space-y-3">
        <SectionHeader
          title="Registration health"
          description="Progress against the key registration milestones."
        />
        <Suspense fallback={<RegistrationHealthSkeleton />}>
          <RegistrationHealth tournamentId={tournamentId} currency={tournament.currency} />
        </Suspense>
      </section>

      {/* Metrics strip */}
      <section className="space-y-3">
        <SectionHeader title="At a glance" />
        <Suspense fallback={<SummaryCardsSkeleton />}>
          <SummaryStrip tournamentId={tournamentId} currency={tournament.currency} />
        </Suspense>
      </section>

      {/* Deadlines + Activity | Quick actions */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-3">
            <SectionHeader
              title="Upcoming deadlines"
              description="Time-sensitive moments to plan around."
            />
            <Suspense fallback={<DeadlinesSkeleton />}>
              <DeadlinesPanel tournamentId={tournamentId} />
            </Suspense>
          </section>

          <section className="space-y-3">
            <SectionHeader
              title="Recent activity"
              action={
                <a
                  href={`/tournaments/${tournamentId}/activity`}
                  className="text-[12.5px] font-medium text-primary hover:underline"
                >
                  View all →
                </a>
              }
            />
            <div className="rounded-lg border border-border bg-card p-4 shadow-xs">
              <Suspense fallback={<RecentActivitySkeleton />}>
                <ActivityPanel tournamentId={tournamentId} />
              </Suspense>
            </div>
          </section>
        </div>

        <aside className="space-y-3">
          <SectionHeader title="Quick actions" />
          <QuickActions tournamentId={tournamentId} isDirector={isDirector} />
        </aside>
      </div>
    </div>
  )
}
