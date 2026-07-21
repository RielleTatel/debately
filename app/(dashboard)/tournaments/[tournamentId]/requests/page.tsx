import Link from 'next/link'
import { requireTournamentReadable } from '@/features/tournaments/permissions'
import { listRequestsForTournament } from '@/features/requests/queries'
import { Badge } from '@/components/ui/badge'

export default async function RequestsPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  await requireTournamentReadable(tournamentId)
  const rows = await listRequestsForTournament(tournamentId)
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Requests</h1>
      <ul className="divide-y rounded-md border">
        {rows.length === 0 && <li className="p-4 text-sm text-muted-foreground">No requests yet.</li>}
        {rows.map((r) => (
          <li key={r.id} className="p-3 flex items-center justify-between">
            <div>
              <Link href={`/tournaments/${tournamentId}/requests/${r.id}`} className="font-medium hover:underline">#{r.sequenceNumber} — {r.type}</Link>
              <p className="text-xs text-muted-foreground">{r.institution.name} · by {r.submitter.displayName}</p>
            </div>
            <Badge variant={r.status === 'PENDING' ? 'default' : r.status === 'APPROVED' ? 'secondary' : r.status === 'REJECTED' ? 'destructive' : 'outline'}>{r.status}</Badge>
          </li>
        ))}
      </ul>
    </div>
  )
}
