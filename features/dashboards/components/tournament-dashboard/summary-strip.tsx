import { prisma } from '@/lib/prisma'
import { getRegistrationAnalytics } from '@/features/analytics/services/registration'
import { getFinancialAnalytics } from '@/features/analytics/services/financial'
import { SummaryCard } from '@/features/dashboards/components/summary-card'
import { formatAmount } from '@/lib/money'

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

  const filledPct = registration.capacity.totalSlots === 0
    ? 0
    : Math.round((registration.capacity.filled / registration.capacity.totalSlots) * 100)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <SummaryCard label="Institutions" value={String(registration.counts.institutions)} />
      <SummaryCard label="Teams" value={String(registration.counts.teams)} />
      <SummaryCard label="Adjudicators" value={String(registration.counts.adjudicators)} />
      <SummaryCard label="Outstanding" value={formatAmount(financial.outstandingMinor, currency)} />
      <SummaryCard
        label="Pending requests"
        value={String(pendingRequests)}
        link={`/tournaments/${tournamentId}/requests`}
      />
      <SummaryCard label="Registration filled" value={`${filledPct}%`} />
    </div>
  )
}
