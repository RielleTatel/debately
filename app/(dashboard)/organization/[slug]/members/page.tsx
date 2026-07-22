import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { resolveOrgAndRequireMembership } from '@/features/organizations/queries'
import { AppError } from '@/lib/errors'
import { requireUser } from '@/features/auth/queries'
import { MembersPanel, MembersPanelSkeleton } from '@/features/organizations/components/members-panel'
import {
  PendingInvitationsPanel,
  PendingInvitationsSkeleton,
} from '@/features/organizations/components/pending-invitations-panel'
import { InviteMemberForm } from '@/features/organizations/components/invite-member-form'

export default async function OrgMembersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [{ org, role }, me] = await Promise.all([
    resolveOrgAndRequireMembership(slug),
    requireUser(),
  ])
  if (!org) notFound()
  if (!role) throw new AppError('FORBIDDEN', 'Access denied', 403)

  return (
    <section className="space-y-8">
      <div>
        <h2 className="mb-2 text-lg font-medium">Members</h2>
        <Suspense fallback={<MembersPanelSkeleton />}>
          <MembersPanel
            orgId={org.id}
            isOwner={role === 'OWNER'}
            currentProfileId={me.profile.id}
          />
        </Suspense>
      </div>
      {role === 'OWNER' && (
        <>
          <div>
            <h2 className="mb-2 text-lg font-medium">Invite a member</h2>
            <InviteMemberForm orgId={org.id} />
          </div>
          <div>
            <h2 className="mb-2 text-lg font-medium">Pending invitations</h2>
            <Suspense fallback={<PendingInvitationsSkeleton />}>
              <PendingInvitationsPanel orgId={org.id} />
            </Suspense>
          </div>
        </>
      )}
    </section>
  )
}
