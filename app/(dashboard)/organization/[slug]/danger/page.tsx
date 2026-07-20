import { notFound } from 'next/navigation'
import { getOrganizationBySlug, getOrgMembers } from '@/features/organizations/queries'
import { requireOrgOwner } from '@/features/organizations/permissions'
import { TransferOwnershipForm } from '@/features/organizations/components/transfer-ownership-form'
import { DeleteOrganizationForm } from '@/features/organizations/components/delete-organization-form'

export default async function DangerZonePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const org = await getOrganizationBySlug(slug); if (!org) notFound()
  const { me } = await requireOrgOwner(org.id)
  const members = await getOrgMembers(org.id)
  return (
    <section className="space-y-8">
      <div><h2 className="mb-2 text-lg font-medium">Transfer ownership</h2>
        <TransferOwnershipForm orgId={org.id} members={members} currentOwnerProfileId={me.profile.id} />
      </div>
      <div><h2 className="mb-2 text-lg font-medium text-red-700">Delete organization</h2>
        <DeleteOrganizationForm orgId={org.id} orgName={org.name} />
      </div>
    </section>
  )
}
