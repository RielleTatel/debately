import { requireTournamentReadable } from '@/features/tournaments/permissions'
import { getExpectationsSummary } from '@/features/imports/queries'
import { ExpectationsTable } from '@/features/imports/components/expectations-table'

export default async function ExpectationsPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  await requireTournamentReadable(tournamentId)
  const rows = await getExpectationsSummary(tournamentId)
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Registration expectations vs. actuals</h1>
        <p className="text-sm text-muted-foreground">Compare Phase 1 intent against imported Phase 2/3 data.</p>
      </div>
      <ExpectationsTable rows={rows} />
    </div>
  )
}
