import { notFound } from 'next/navigation'
import { getTournamentContext } from '@/features/tournaments/queries'
import { isAppError } from '@/lib/errors'
import { TournamentSubNav } from '@/components/navigation/tournament-sub-nav'

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
  const { tournament, role, isDirector } = ctx

  return (
    <div className="flex h-full">
      <TournamentSubNav
        tournamentId={tournamentId}
        tournamentName={tournament.name}
        logoUrl={tournament.logoUrl}
        role={role}
        isDirector={isDirector}
      />
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  )
}
