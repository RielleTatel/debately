import { getRegistrationAnalytics } from '@/features/analytics/services/registration'
import { StatusIndicators } from '@/features/dashboards/components/status-indicators'

export async function StatusPanel({
  tournamentId,
  tournament,
}: {
  tournamentId: string
  tournament: { status: string; registrationOpen: boolean }
}) {
  const registration = await getRegistrationAnalytics(tournamentId)
  return (
    <StatusIndicators
      tournament={tournament}
      filled={registration.capacity.filled}
      totalSlots={registration.capacity.totalSlots}
    />
  )
}
