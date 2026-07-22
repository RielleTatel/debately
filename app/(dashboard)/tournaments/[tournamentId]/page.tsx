import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireTournamentReadable } from '@/features/tournaments/permissions'
import { getInstitutionsForTournament } from '@/features/institutions/queries'
import { getFinancialAnalytics } from '@/features/analytics/services/financial'
import { getRegistrationAnalytics } from '@/features/analytics/services/registration'
import { listRecentActivityForTournament } from '@/features/activity/queries/activity'
import { prisma } from '@/lib/prisma'
import { SummaryCard } from '@/features/dashboards/components/summary-card'
import { RecentActivityFeed } from '@/features/dashboards/components/recent-activity-feed'
import { QuickActions } from '@/features/dashboards/components/quick-actions'
import { StatusIndicators } from '@/features/dashboards/components/status-indicators'
import { formatAmount } from '@/lib/money'

export default async function OrganizerDashboardPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  const ctx = await requireTournamentReadable(tournamentId)
  const { tournament } = ctx

  const [institutions, financial, registration, recent, pendingRequests] = await Promise.all([
    getInstitutionsForTournament(tournamentId), getFinancialAnalytics(tournamentId), getRegistrationAnalytics(tournamentId),
    listRecentActivityForTournament(tournamentId, 10),
    prisma.request.count({ where: { tournamentId, status: 'PENDING' } }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold">{tournament.name}</h1><p className="text-sm text-muted-foreground">{tournament.venue} · {tournament.startDate.toDateString()}</p></div>
        <Link href={`/tournaments/${tournamentId}/settings`} className="text-sm text-primary hover:underline">Settings</Link>
      </div>
      <StatusIndicators tournament={tournament} filled={registration.capacity.filled} totalSlots={registration.capacity.totalSlots} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Institutions" value={String(institutions.length)} />
        <SummaryCard label="Teams" value={String(registration.counts.teams)} />
        <SummaryCard label="Adjudicators" value={String(registration.counts.adjudicators)} />
        <SummaryCard label="Outstanding" value={formatAmount(financial.outstandingMinor, tournament.currency)} />
        <SummaryCard label="Pending requests" value={String(pendingRequests)} link={`/tournaments/${tournamentId}/requests`} />
        <SummaryCard label="Registration filled" value={`${Math.round(registration.capacity.totalSlots === 0 ? 0 : (registration.capacity.filled / registration.capacity.totalSlots) * 100)}%`} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2"><h2 className="text-lg font-semibold mb-3">Recent activity</h2><RecentActivityFeed rows={recent} /></div>
        <div><h2 className="text-lg font-semibold mb-3">Quick actions</h2><QuickActions tournamentId={tournamentId} isDirector /></div>
      </div>
    </div>
  )
}
