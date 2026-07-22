import { requireTournamentReadable } from '@/features/tournaments/permissions'
import { listActivityLogForTournament } from '@/features/activity/queries/activity'
import { ACTION_LABELS } from '@/features/activity/services/action-catalog'

export default async function ActivityPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  await requireTournamentReadable(tournamentId)
  const rows = await listActivityLogForTournament(tournamentId, { take: 100 })
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Activity log</h1>
      <ul className="divide-y rounded-lg border text-sm">
        {rows.length === 0 && <li className="p-4 text-muted-foreground">No activity yet.</li>}
        {rows.map((r) => (
          <li key={r.id} className="p-3 flex items-center justify-between">
            <div>
              <p className="font-medium">{ACTION_LABELS[r.action]}</p>
              <p className="text-xs text-muted-foreground">{r.description} · by {r.actor?.displayName ?? 'System'}</p>
            </div>
            <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
