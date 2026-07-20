import { notFound } from 'next/navigation'
import { getOrganizationBySlug, getOrgMembers, getPendingInvitations } from '@/features/organizations/queries'
import { requireOrgMember } from '@/features/organizations/permissions'
import { MembersTable } from '@/features/organizations/components/members-table'
import { PendingInvitationsTable } from '@/features/organizations/components/pending-invitations-table'
import { InviteMemberForm } from '@/features/organizations/components/invite-member-form'

export default async function OrgMembersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const org = await getOrganizationBySlug(slug); if (!org) notFound()
  const { role } = await requireOrgMember(org.id)
  const [members, invitations] = await Promise.all([
    getOrgMembers(org.id),
    role === 'OWNER' ? getPendingInvitations(org.id) : Promise.resolve([]),
  ])
  return (
    <section className="space-y-8">
      <div><h2 className="mb-2 text-lg font-medium">Members</h2><MembersTable members={members} /></div>
      {role === 'OWNER' && <>
        <div><h2 className="mb-2 text-lg font-medium">Invite a member</h2><InviteMemberForm orgId={org.id} /></div>
        <div><h2 className="mb-2 text-lg font-medium">Pending invitations</h2><PendingInvitationsTable invitations={invitations} /></div>
      </>}
    </section>
  )
}
