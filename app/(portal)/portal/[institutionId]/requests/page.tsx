import Link from 'next/link'
import { requireInstitutionRep } from '@/features/portal/permissions'
import { listRequestsForInstitution } from '@/features/requests/queries'
import { Badge } from '@/components/ui/badge'

export default async function PortalRequestsPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const { institutionId } = await params
  const { institution } = await requireInstitutionRep(institutionId)
  const list = await listRequestsForInstitution(institution.id)

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Requests</h1>
        <Link href={`/portal/${institutionId}/requests/new`} className="text-sm text-primary hover:underline">
          New request
        </Link>
      </div>
      <ul className="divide-y rounded-md border">
        {list.length === 0 && <li className="p-4 text-sm text-muted-foreground">No requests yet.</li>}
        {list.map((r) => (
          <li key={r.id} className="p-3">
            <div className="flex items-center justify-between">
              <Link href={`/portal/${institutionId}/requests/${r.id}`} className="font-medium hover:underline">
                #{r.sequenceNumber} — {r.type}
              </Link>
              <Badge
                variant={
                  r.status === 'PENDING'
                    ? 'default'
                    : r.status === 'APPROVED'
                      ? 'secondary'
                      : r.status === 'REJECTED'
                        ? 'destructive'
                        : 'outline'
                }
              >
                {r.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              by {r.submitter.displayName} · {new Date(r.createdAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
