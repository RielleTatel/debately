import { requireTournamentDirector } from '@/features/tournaments/permissions'
import { getRegistrationAnalytics, getFinancialAnalytics, getImportAnalytics, getRequestAnalytics } from '@/features/analytics/services'
import { RegistrationCharts } from '@/features/dashboards/components/registration-charts'
import { FinancialCharts } from '@/features/dashboards/components/financial-charts'
import { ImportCharts } from '@/features/dashboards/components/import-charts'
import { RequestCharts } from '@/features/dashboards/components/request-charts'

export default async function AnalyticsPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  await requireTournamentDirector(tournamentId)
  const [reg, fin, imp, req] = await Promise.all([
    getRegistrationAnalytics(tournamentId), getFinancialAnalytics(tournamentId), getImportAnalytics(tournamentId), getRequestAnalytics(tournamentId),
  ])
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <section><h2 className="text-lg font-medium mb-3">Registration</h2><RegistrationCharts {...reg} /></section>
      <section><h2 className="text-lg font-medium mb-3">Financial</h2><FinancialCharts {...fin} /></section>
      <section><h2 className="text-lg font-medium mb-3">Imports</h2><ImportCharts {...imp} /></section>
      <section><h2 className="text-lg font-medium mb-3">Requests</h2><RequestCharts {...req} /></section>
    </div>
  )
}
