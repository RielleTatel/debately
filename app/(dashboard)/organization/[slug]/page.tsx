import { notFound } from 'next/navigation'
import { resolveOrgBySlug } from '@/features/organizations/queries'

export default async function OrganizationOverview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { org } = await resolveOrgBySlug(slug)
  if (!org) notFound()
  return (
    <section>
      <h2 className="mb-2 text-lg font-medium">Overview</h2>
      <p className="text-slate-600">{org.description ?? 'No description yet.'}</p>
    </section>
  )
}
