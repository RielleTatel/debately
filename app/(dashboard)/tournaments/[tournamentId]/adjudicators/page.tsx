import { requireTournamentDirector } from '@/features/tournaments/permissions'
import { getAdjudicatorsForTournament } from '@/features/adjudicators/queries'
import { AdjudicatorList } from '@/features/adjudicators/components/adjudicator-list'

export default async function AdjudicatorsPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  await requireTournamentDirector(tournamentId)
  const adjudicators = await getAdjudicatorsForTournament(tournamentId)
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Adjudicators (unified view)</h1>
      <AdjudicatorList adjudicators={adjudicators as never} showDirectorNotes />
    </div>
  )
}
