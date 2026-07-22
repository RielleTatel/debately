import { getRegistrationAnalytics } from '@/features/analytics/services/registration'
import { RegistrationCharts } from '@/features/dashboards/components/registration-charts'

export async function RegistrationAnalyticsPanel({ tournamentId }: { tournamentId: string }) {
  const data = await getRegistrationAnalytics(tournamentId)
  return <RegistrationCharts {...data} />
}
