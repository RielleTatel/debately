import { prisma } from '@/lib/prisma'
import { getRegistrationAnalytics } from '@/features/analytics/services/registration'
import { getFinancialAnalytics } from '@/features/analytics/services/financial'
import { MetricCard } from '@/components/ui/metric-card'
import { formatAmount } from '@/lib/money'
import { Building2, Users, UserCheck, Wallet, Inbox } from 'lucide-react'

export async function SummaryStrip({
  tournamentId,
  currency,
}: {
  tournamentId: string
  currency: string
}) {
  const [registration, financial, pendingRequests] = await Promise.all([
    getRegistrationAnalytics(tournamentId),
    getFinancialAnalytics(tournamentId),
    prisma.request.count({ where: { tournamentId, status: 'PENDING' } }),
  ])

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      <MetricCard
        label="Institutions"
        value={registration.counts.institutions}
        icon={<Building2 className="h-3.5 w-3.5" strokeWidth={2} />}
        href={`/tournaments/${tournamentId}/institutions`}
      />
      <MetricCard
        label="Teams"
        value={registration.counts.teams}
        icon={<Users className="h-3.5 w-3.5" strokeWidth={2} />}
        href={`/tournaments/${tournamentId}/teams`}
      />
      <MetricCard
        label="Adjudicators"
        value={registration.counts.adjudicators}
        icon={<UserCheck className="h-3.5 w-3.5" strokeWidth={2} />}
        href={`/tournaments/${tournamentId}/adjudicators`}
      />
      <MetricCard
        label="Outstanding"
        value={formatAmount(financial.outstandingMinor, currency)}
        icon={<Wallet className="h-3.5 w-3.5" strokeWidth={2} />}
        href={`/tournaments/${tournamentId}/finance`}
        hint={
          financial.statusCount.UNPAID + financial.statusCount.PARTIAL > 0
            ? `${financial.statusCount.UNPAID + financial.statusCount.PARTIAL} invoices open`
            : 'All settled'
        }
      />
      <MetricCard
        label="Pending requests"
        value={pendingRequests}
        icon={<Inbox className="h-3.5 w-3.5" strokeWidth={2} />}
        href={`/tournaments/${tournamentId}/requests`}
      />
    </div>
  )
}
