import Link from 'next/link'
import { requireUser } from '@/features/auth/queries'
import { getMyOrganizations } from '@/features/organizations/queries'

export default async function OrganizationListPage() {
  await requireUser()
  const orgs = await getMyOrganizations()
  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your organizations</h1>
        <Link href="/organization/new" className="rounded bg-blue-700 px-3 py-1.5 text-sm text-white">New organization</Link>
      </div>
      {orgs.length === 0 ? (
        <p className="text-slate-600">You are not a member of any organization yet. <Link href="/organization/new" className="underline">Create one</Link>.</p>
      ) : (
        <ul className="divide-y rounded border">
          {orgs.map((o) => (
            <li key={o.id} className="flex items-center justify-between p-4">
              <div>
                <Link href={`/organization/${o.slug}`} className="font-medium hover:underline">{o.name}</Link>
                <div className="text-xs text-slate-500">/{o.slug} · {o.role}</div>
              </div>
              <Link href={`/organization/${o.slug}`} className="text-sm underline">Open</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
