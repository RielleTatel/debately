import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTournamentContext } from '@/features/tournaments/queries'
import { isAppError } from '@/lib/errors'

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  ARCHIVED: 'bg-amber-100 text-amber-800',
}

type Props = { params: Promise<{ tournamentId: string }> }

export default async function TournamentDashboardPage({ params }: Props) {
  const { tournamentId } = await params
  let ctx
  try {
    ctx = await getTournamentContext(tournamentId)
  } catch (e) {
    if (isAppError(e) && (e.code === 'NOT_FOUND' || e.code === 'FORBIDDEN')) notFound()
    throw e
  }
  const { tournament, isDirector } = ctx
  const readOnly = tournament.status === 'COMPLETED' || tournament.status === 'ARCHIVED'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {tournament.logoUrl && (
            <Image src={tournament.logoUrl} alt="" width={64} height={64} className="rounded" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{tournament.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLES[tournament.status]}`}>
                {tournament.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {tournament.venue} · {tournament.startDate.toDateString()} – {tournament.endDate.toDateString()}
            </p>
          </div>
        </div>
        {isDirector && (
          <Link href={`/tournaments/${tournament.id}/settings`} className="text-sm text-primary hover:underline">
            Settings
          </Link>
        )}
      </div>

      {readOnly && (
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          This tournament is {tournament.status.toLowerCase()} and is read-only.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PlaceholderCard title="Institutions" body="Registration import lands in Phase 4." />
        <PlaceholderCard title="Teams" body="Team management lands in Phase 5+." />
        <PlaceholderCard title="Schedule" body={`${tournament.registrationDeadline.toDateString()} — registration deadline`} />
      </div>
    </div>
  )
}

function PlaceholderCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border p-4">
      <h2 className="font-medium">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  )
}
