import { AsyncSection } from '@/components/async-section'
import { getImportAnalytics } from '@/features/analytics/services'
import { ImportCharts } from '@/features/dashboards/components/import-charts'

export async function ImportAnalyticsPanel({ tournamentId }: { tournamentId: string }) {
  return (
    <AsyncSection
      label="Import analytics"
      load={async () => {
        const data = await getImportAnalytics(tournamentId)
        return <ImportCharts {...data} />
      }}
    />
  )
}
