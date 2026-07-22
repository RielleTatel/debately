import { getRequestAnalytics } from '@/features/analytics/services'
import { RequestCharts } from '@/features/dashboards/components/request-charts'

export async function RequestAnalyticsPanel({ tournamentId }: { tournamentId: string }) {
  const data = await getRequestAnalytics(tournamentId)
  return <RequestCharts {...data} />
}
