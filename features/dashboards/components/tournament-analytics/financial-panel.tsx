import { getFinancialAnalytics } from '@/features/analytics/services/financial'
import { FinancialCharts } from '@/features/dashboards/components/financial-charts'

export async function FinancialAnalyticsPanel({ tournamentId }: { tournamentId: string }) {
  const data = await getFinancialAnalytics(tournamentId)
  return <FinancialCharts {...data} />
}
