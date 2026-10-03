import { AsyncSection } from '@/components/async-section'
import { getRequestAnalytics } from '@/features/analytics/services'
import { RequestCharts } from '@/features/dashboards/components/request-charts'

export async function RequestAnalyticsPanel({ tournamentId }: { tournamentId: string }) {
  return (
    <AsyncSection
      label="Request analytics"
      load={async () => {
        const data = await getRequestAnalytics(tournamentId)
        return <RequestCharts {...data} />
      }}
    />
  )
}
