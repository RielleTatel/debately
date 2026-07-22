import { requireInstitutionRep } from '@/features/portal/permissions'
import { getRequestById } from '@/features/requests/queries'
import { listActivitiesForRequest } from '@/features/requests/queries/activities'
import { RequestThread } from '@/features/requests/components/request-thread'
import { notFound } from 'next/navigation'

export default async function PortalRequestDetailPage({
  params,
}: {
  params: Promise<{ institutionId: string; requestId: string }>
}) {
  const { institutionId, requestId } = await params
  await requireInstitutionRep(institutionId)
  const r = await getRequestById(requestId)
  if (!r || r.tournamentInstitutionId !== institutionId) notFound()
  const activities = await listActivitiesForRequest(requestId)

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold">
        Request #{r.sequenceNumber} — {r.type}
      </h1>
      <div className="rounded-lg border p-4 space-y-2 text-sm">
        <p>
          <strong>Status:</strong> {r.status}
        </p>
        <p>
          <strong>Description:</strong> {r.description}
        </p>
        <pre className="text-xs bg-muted p-2 rounded">{JSON.stringify(r.payload, null, 2)}</pre>
      </div>
      <RequestThread activities={activities} />
    </div>
  )
}
