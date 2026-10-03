import { notFound } from 'next/navigation'
import { getTournamentContext } from '@/features/tournaments/queries'
import { isAppError } from '@/lib/errors'
import { TournamentHeader } from '@/features/tournaments/components/tournament-header'
import { TournamentTabs } from '@/features/tournaments/components/tournament-tabs'
import { Suspense } from 'react'
import { TournamentCapacity } from '@/features/tournaments/components/tournament-capacity'

type Props = { params: Promise<{ tournamentId: string }>; children: React.ReactNode }

export default async function TournamentLayout({ params, children }: Props) {
  const { tournamentId } = await params
  let ctx
  try {
    ctx = await getTournamentContext(tournamentId)
  } catch (e) {
    if (isAppError(e) && (e.code === 'NOT_FOUND' || e.code === 'FORBIDDEN')) notFound()
    throw e
  }
  const { tournament, isDirector } = ctx

  return (
    <div className="flex min-h-full flex-col">
      <TournamentHeader
        tournament={tournament}
        isDirector={isDirector}
        capacity={
          <Suspense fallback={<>{tournament.maxTeamSlots} team slots</>}>
            <TournamentCapacity tournamentId={tournamentId} total={tournament.maxTeamSlots} />
          </Suspense>
        }
      />
      <TournamentTabs tournamentId={tournamentId} />
      <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">{children}</div>
    </div>
  )
}
