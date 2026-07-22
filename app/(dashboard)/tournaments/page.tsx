import Link from 'next/link'
import { listTournamentsForCurrentUser } from '@/features/tournaments/queries'
import { getMyOrganizations } from '@/features/organizations/queries'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  ARCHIVED: 'Archived',
}

export default async function TournamentsPage() {
  const [tournaments, orgs] = await Promise.all([
    listTournamentsForCurrentUser(),
    getMyOrganizations(),
  ])

  const firstOwnedOrg = orgs.find((o) => o.role === 'OWNER') ?? orgs[0]
  const canCreate = !!firstOwnedOrg

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tournaments</h1>
        {canCreate && (
          <Link
            href={`/tournaments/create?orgId=${firstOwnedOrg.id}`}
            className={cn(
              'inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'ring-offset-background transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            Create tournament
          </Link>
        )}
      </div>

      {tournaments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You don&apos;t have any tournaments yet.
          {canCreate ? ' Create your first one to get started.' : ' Join or create an organization first.'}
        </p>
      ) : (
        <ul className="divide-y rounded-md border">
          {tournaments.map((t) => (
            <li key={t.id} className="flex items-center justify-between p-4">
              <div>
                <Link href={`/tournaments/${t.id}`} className="font-medium hover:underline">
                  {t.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {t.orgName} · {STATUS_LABELS[t.status] ?? t.status} · {t.startDate.toDateString()}
                </p>
              </div>
              <Link href={`/tournaments/${t.id}/settings`} className="text-sm text-primary hover:underline">
                Settings
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
