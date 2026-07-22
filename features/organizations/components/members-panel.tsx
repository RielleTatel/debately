import { getOrgMembers } from '@/features/organizations/queries'
import { MembersTable } from '@/features/organizations/components/members-table'

export async function MembersPanel({
  orgId,
  isOwner,
  currentProfileId,
}: {
  orgId: string
  isOwner: boolean
  currentProfileId: string
}) {
  const members = await getOrgMembers(orgId)
  return (
    <MembersTable
      members={members}
      isOwner={isOwner}
      currentProfileId={currentProfileId}
      orgId={orgId}
    />
  )
}

export function MembersPanelSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded bg-muted h-10 w-full" />
      ))}
    </div>
  )
}
