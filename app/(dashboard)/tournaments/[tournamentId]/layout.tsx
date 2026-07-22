import Link from 'next/link'
import Image from 'next/image'
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
  const { tournament } = ctx

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 border-b px-6 py-3">
        {tournament.logoUrl && (
          <Image src={tournament.logoUrl} alt="" width={32} height={32} className="rounded" />
        )}
        <Link href={`/tournaments/${tournamentId}`} className="text-lg font-semibold hover:text-primary">
          {tournament.name}
        </Link>
      </div>
      <TournamentSubNav tournamentId={tournamentId} />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
