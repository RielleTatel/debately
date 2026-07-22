import { notFound } from 'next/navigation'
import { resolveOrgAndRequireMembership } from '@/features/organizations/queries'
import { AppError } from '@/lib/errors'
import { OrganizationSettingsForm } from '@/features/organizations/components/organization-settings-form'
import { LogoUploader } from '@/features/organizations/components/logo-uploader'

export default async function OrgSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { org, role } = await resolveOrgAndRequireMembership(slug)
  if (!org) notFound()
  if (role !== 'OWNER') throw new AppError('FORBIDDEN', 'Only the owner can perform this action', 403)
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
