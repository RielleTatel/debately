import { notFound } from 'next/navigation'
import { getOrganizationBySlug } from '@/features/organizations/queries'
import { requireOrgOwner } from '@/features/organizations/permissions'
import { OrganizationSettingsForm } from '@/features/organizations/components/organization-settings-form'
import { LogoUploader } from '@/features/organizations/components/logo-uploader'

export default async function OrgSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const org = await getOrganizationBySlug(slug); if (!org) notFound()
  await requireOrgOwner(org.id)
  return (
    <section className="space-y-8">
      <div><h2 className="mb-2 text-lg font-medium">Organization details</h2>
        <OrganizationSettingsForm orgId={org.id} defaultValues={{ name: org.name, slug: org.slug, description: org.description ?? '' }} />
      </div>
      <div><h2 className="mb-2 text-lg font-medium">Logo</h2>
        <LogoUploader orgId={org.id} currentUrl={org.logoUrl} />
      </div>
    </section>
  )
}
