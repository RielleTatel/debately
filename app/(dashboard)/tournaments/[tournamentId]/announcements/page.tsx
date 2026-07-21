import Link from 'next/link'
import { requireTournamentReadable } from '@/features/tournaments/permissions'
import { listAnnouncementsForTournament } from '@/features/announcements/queries'

export default async function AnnouncementsPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  await requireTournamentReadable(tournamentId)
  const rows = await listAnnouncementsForTournament(tournamentId)
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Announcements</h1>
        <Link href={`/tournaments/${tournamentId}/announcements/new`} className="text-sm text-primary hover:underline">New announcement</Link>
      </div>
      <ul className="divide-y rounded-md border">
        {rows.length === 0 && <li className="p-4 text-sm text-muted-foreground">No announcements yet.</li>}
        {rows.map((a) => (
          <li key={a.id} className="p-3 flex items-center justify-between">
            <div>
              <Link href={`/tournaments/${tournamentId}/announcements/${a.id}`} className="font-medium hover:underline">{a.title}</Link>
              <p className="text-xs text-muted-foreground">{a.status} · by {a.author.displayName}</p>
            </div>
            <p className="text-xs text-muted-foreground">Read {a.readCount} / targets {a.isAllInstitutions ? 'ALL' : a.targetCount}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
