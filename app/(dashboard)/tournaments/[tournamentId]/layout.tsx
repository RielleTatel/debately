import { notFound } from 'next/navigation'
import { getTournamentContext } from '@/features/tournaments/queries'
import { isAppError } from '@/lib/errors'
import { TournamentHeader } from '@/features/tournaments/components/tournament-header'
import { TournamentTabs } from '@/features/tournaments/components/tournament-tabs'
import { getRegistrationAnalytics } from '@/features/analytics/services/registration'

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

  // Cheap enough to include in the layout for the capacity indicator.
  // If we later find this is expensive, hoist it into an <Suspense> island.
  let filled: number | undefined
  try {
    const reg = await getRegistrationAnalytics(tournamentId)
    filled = reg.capacity.filled
  } catch {
    filled = undefined
  }

  return (
    <div className="flex min-h-full flex-col">
      <TournamentHeader
        tournament={tournament}
        isDirector={isDirector}
        filledSlots={filled}
      />
      <TournamentTabs tournamentId={tournamentId} />
      <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">{children}</div>
    </div>
  )
}
