import { getImportAnalytics } from '@/features/analytics/services'
import { ImportCharts } from '@/features/dashboards/components/import-charts'

export async function ImportAnalyticsPanel({ tournamentId }: { tournamentId: string }) {
  const data = await getImportAnalytics(tournamentId)
  return <ImportCharts {...data} />
}
