import { requireTournamentReadable } from '@/features/tournaments/permissions'
import { getInstitutionsForTournament } from '@/features/institutions/queries'
import { getInstitutionBalance } from '@/features/finance/queries/balance'
import { FinanceOverviewTable } from '@/features/finance/components/finance-overview-table'

export default async function FinancePage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  await requireTournamentReadable(tournamentId)
  const institutions = await getInstitutionsForTournament(tournamentId)
  const balances = await Promise.all(institutions.map(async (i) => ({ institutionId: i.id, institutionName: i.name, balance: await getInstitutionBalance(i.id).catch(() => null) })))
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Finance overview</h1>
      <FinanceOverviewTable rows={balances} />
    </div>
  )
}
