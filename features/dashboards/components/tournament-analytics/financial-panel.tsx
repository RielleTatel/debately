import { AsyncSection } from '@/components/async-section'
import { getFinancialAnalytics } from '@/features/analytics/services/financial'
import { FinancialCharts } from '@/features/dashboards/components/financial-charts'

export async function FinancialAnalyticsPanel({ tournamentId }: { tournamentId: string }) {
  return (
    <AsyncSection
      label="Financial analytics"
      load={async () => {
        const data = await getFinancialAnalytics(tournamentId)
        return (
          <div className="space-y-4">
            {data.byCurrency.map((group) => (
              <div key={group.currency}>
                <h3 className="mb-2 text-sm font-medium">{group.currency}</h3>
                <FinancialCharts {...group} />
              </div>
            ))}
          </div>
        )
      }}
    />
  )
}
