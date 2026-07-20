import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { resolveOrgBySlug } from '@/features/organizations/queries'
import { requireOrgMember } from '@/features/organizations/permissions'

export default async function OrganizationLayout({
  children, params,
}: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { org, redirectTo } = await resolveOrgBySlug(slug)
  if (redirectTo) redirect(redirectTo)
  if (!org) notFound()
  const { role } = await requireOrgMember(org.id)

  return (
    <div className="mx-auto max-w-5xl p-6">
      <header className="mb-6 flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-xl font-semibold">{org.name}</h1>
          <div className="text-xs text-slate-500">/{org.slug} · {role}</div>
        </div>
        <nav className="flex gap-4 text-sm">
          <Link href={`/organization/${org.slug}`}>Overview</Link>
          <Link href={`/organization/${org.slug}/members`}>Members</Link>
          {role === 'OWNER' && (<>
            <Link href={`/organization/${org.slug}/settings`}>Settings</Link>
            <Link href={`/organization/${org.slug}/danger`} className="text-red-600">Danger</Link>
          </>)}
        </nav>
      </header>
      {children}
    </div>
  )
}
