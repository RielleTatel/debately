import { prisma } from '@/lib/prisma'
import { getRegistrationAnalytics } from '@/features/analytics/services/registration'
import { getFinancialAnalytics } from '@/features/analytics/services/financial'
import { ProgressCard } from '@/components/ui/progress-card'
import { formatAmount } from '@/lib/money'

export async function RegistrationHealth({
  tournamentId,
  currency,
}: {
  tournamentId: string
  currency: string
}) {
  const [registration, financial, institutions] = await Promise.all([
    getRegistrationAnalytics(tournamentId),
    getFinancialAnalytics(tournamentId),
    prisma.tournamentInstitution.count({ where: { tournamentId } }),
  ])

  const teamSlots = registration.capacity
  const claimedInst = registration.claimBreakdown.claimed
  const totalInvoiced = financial.totalInvoicedMinor
  const totalPaid = financial.totalPaidMinor
  const paymentsTone: 'default' | 'warning' | 'success' =
    totalInvoiced === 0
      ? 'default'
      : totalPaid / totalInvoiced >= 0.9
        ? 'success'
        : totalPaid / totalInvoiced < 0.5
          ? 'warning'
          : 'default'

  const capacityTone: 'default' | 'warning' | 'success' =
    teamSlots.totalSlots === 0
      ? 'default'
      : teamSlots.filled / teamSlots.totalSlots >= 0.9
        ? 'success'
        : teamSlots.filled / teamSlots.totalSlots < 0.4
          ? 'warning'
          : 'default'

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <ProgressCard
        label="Team slots filled"
        value={teamSlots.filled}
        total={teamSlots.totalSlots}
        tone={capacityTone}
        hint={
          teamSlots.deadline
            ? `Reg. closes ${teamSlots.deadline.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
            : 'No deadline set'
        }
      />
      <ProgressCard
        label="Institutions claimed"
        value={claimedInst}
        total={institutions}
        hint={
          institutions - claimedInst > 0
            ? `${institutions - claimedInst} awaiting claim`
            : 'All claimed'
        }
      />
      <ProgressCard
        label="Payments collected"
        value={Math.round(totalPaid / 100)}
        total={Math.round(totalInvoiced / 100) || 1}
        tone={paymentsTone}
        hint={
          totalInvoiced === 0
            ? 'No invoices yet'
            : `${formatAmount(totalPaid, currency)} of ${formatAmount(totalInvoiced, currency)}`
        }
      />
    </div>
  )
}
