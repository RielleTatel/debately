import { getPendingInvitations } from '@/features/organizations/queries'
import { PendingInvitationsTable } from '@/features/organizations/components/pending-invitations-table'

export async function PendingInvitationsPanel({ orgId }: { orgId: string }) {
  const invitations = await getPendingInvitations(orgId)
  return <PendingInvitationsTable invitations={invitations} isOwner />
}

export function PendingInvitationsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded bg-muted h-8 w-full" />
      ))}
    </div>
  )
}
