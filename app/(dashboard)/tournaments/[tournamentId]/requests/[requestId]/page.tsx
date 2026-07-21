import { requireTournamentReadable } from '@/features/tournaments/permissions'
import { getRequestById } from '@/features/requests/queries'
import { approveRequestAction, rejectRequestAction } from '@/features/requests/actions'
import { listActivitiesForRequest } from '@/features/requests/queries/activities'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'

export default async function RequestDetailPage({ params }: { params: Promise<{ tournamentId: string; requestId: string }> }) {
  const { tournamentId, requestId } = await params
  await requireTournamentReadable(tournamentId)
  const r = await getRequestById(requestId)
  if (!r || r.tournamentId !== tournamentId) notFound()
  const activities = await listActivitiesForRequest(requestId)
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Request #{r.sequenceNumber} — {r.type}</h1>
      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm"><strong>Institution:</strong> {r.institution.name}</p>
        <p className="text-sm"><strong>Submitted by:</strong> {r.submitter.displayName}</p>
        <p className="text-sm"><strong>Status:</strong> {r.status}</p>
        <p className="text-sm"><strong>Description:</strong> {r.description}</p>
        <pre className="text-xs bg-muted p-2 rounded">{JSON.stringify(r.payload, null, 2)}</pre>
      </div>
      {(r.status === 'PENDING' || r.status === 'MORE_INFO') && (
        <div className="flex gap-2">
          <form action={approveRequestAction as unknown as (fd: FormData) => void}>
            <input type="hidden" name="requestId" value={r.id} />
            <Button type="submit">Approve</Button>
          </form>
          <form action={rejectRequestAction as unknown as (fd: FormData) => void} className="flex gap-2 items-end">
            <input type="hidden" name="requestId" value={r.id} />
            <input type="text" name="reason" placeholder="Reason" className="rounded border p-1 text-sm" required minLength={5} />
            <Button type="submit" variant="destructive">Reject</Button>
          </form>
        </div>
      )}
      <div>
        <h2 className="font-medium mb-2">Activity</h2>
        <ul className="space-y-2 text-sm">
          {activities.map((a) => (<li key={a.id} className="flex gap-2"><span className="font-medium">{a.kind}</span> by {a.actor.displayName} · {new Date(a.createdAt).toLocaleString()}{a.note && <span className="text-muted-foreground">: {a.note}</span>}</li>))}
        </ul>
      </div>
    </div>
  )
}
