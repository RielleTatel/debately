import { AsyncSection } from '@/components/async-section'
import { getRegistrationAnalytics } from '@/features/analytics/services/registration'
import { RegistrationCharts } from '@/features/dashboards/components/registration-charts'

export async function RegistrationAnalyticsPanel({ tournamentId }: { tournamentId: string }) {
  return (
    <AsyncSection
      label="Registration analytics"
      load={async () => {
        const data = await getRegistrationAnalytics(tournamentId)
        return <RegistrationCharts {...data} />
      }}
    />
  )
}
