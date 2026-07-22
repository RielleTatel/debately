import Link from 'next/link'
import Image from 'next/image'
import { Plus, ChevronRight, Calendar, Building2, Trophy, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getMyOrganizations } from '@/features/organizations/queries'
import { listTournamentsForCurrentUser } from '@/features/tournaments/queries'
import type { TournamentListItem, TournamentStatus } from '@/features/tournaments/types'
import type { OrganizationWithRole } from '@/features/organizations/types'

const STATUS_STYLES: Record<TournamentStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  ARCHIVED: 'bg-slate-100 text-slate-500',
}
const STATUS_LABELS: Record<TournamentStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  ARCHIVED: 'Archived',
}

function formatDateRange(start: Date, end: Date | null): string {
  const s = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (!end) return s
  const sameYear = start.getFullYear() === end.getFullYear()
  const e = end.toLocaleDateString(
    'en-US',
    sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' },
  )
  return `${s} – ${e}${sameYear ? `, ${start.getFullYear()}` : ''}`
}

export async function DashboardBodyPanel() {
  const [orgs, tournaments] = await Promise.all([
    getMyOrganizations(),
    listTournamentsForCurrentUser(),
  ])
  const firstOwnedOrg = orgs.find((o) => o.role === 'OWNER') ?? orgs[0]
  const canCreateTournament = !!firstOwnedOrg

  return (
    <>
      <section className="space-y-4">
        <div className="flex items-end justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Tournaments</h2>
            <p className="mt-0.5 text-sm text-slate-500">Open a workspace to manage teams, schedules and finance.</p>
          </div>
          {canCreateTournament && (
            <Link
              href={`/tournaments/create?orgId=${firstOwnedOrg.id}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              New tournament
            </Link>
          )}
        </div>
        {tournaments.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No tournaments yet"
            description={
              canCreateTournament
                ? 'Create your first tournament to start inviting institutions and teams.'
                : 'You need to be part of an organization to create a tournament.'
            }
            action={
              canCreateTournament
                ? { label: 'Create tournament', href: `/tournaments/create?orgId=${firstOwnedOrg.id}` }
                : { label: 'Create organization', href: '/organization/new' }
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Organizations</h2>
            <p className="mt-0.5 text-sm text-slate-500">Groups you own or belong to.</p>
          </div>
          <Link
            href="/organization/new"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            New organization
          </Link>
        </div>
        {orgs.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No organizations yet"
            description="Create your first organization to invite teammates and host tournaments."
            action={{ label: 'Create organization', href: '/organization/new' }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {orgs.map((o) => (
              <OrganizationCard
                key={o.id}
                org={o}
                tournamentCount={tournaments.filter((t) => t.orgSlug === o.slug).length}
              />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export function DashboardBodySkeleton() {
  return (
    <>
      <section className="space-y-4">
        <div className="flex items-end justify-between border-b border-slate-200 pb-3">
          <div className="space-y-2">
            <div className="animate-pulse rounded bg-muted h-5 w-32" />
            <div className="animate-pulse rounded bg-muted h-4 w-64" />
          </div>
          <div className="animate-pulse rounded bg-muted h-8 w-36" />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-muted h-28 w-full" />
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <div className="flex items-end justify-between border-b border-slate-200 pb-3">
          <div className="space-y-2">
            <div className="animate-pulse rounded bg-muted h-5 w-32" />
            <div className="animate-pulse rounded bg-muted h-4 w-48" />
          </div>
          <div className="animate-pulse rounded bg-muted h-8 w-40" />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-muted h-16 w-full" />
          ))}
        </div>
      </section>
    </>
  )
}

function TournamentCard({ tournament }: { tournament: TournamentListItem }) {
  return (
    <Link
      href={`/tournaments/${tournament.id}`}
      className="group relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        {tournament.logoUrl ? (
          <Image
            src={tournament.logoUrl}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
            {tournament.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-slate-950">
              {tournament.name}
            </p>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-slate-600" strokeWidth={2} />
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500">{tournament.orgName}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 text-slate-500">
          <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
          {formatDateRange(tournament.startDate, tournament.endDate)}
        </span>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
            STATUS_STYLES[tournament.status],
          )}
        >
          {STATUS_LABELS[tournament.status]}
        </span>
      </div>
    </Link>
  )
}

function OrganizationCard({
  org,
  tournamentCount,
}: {
  org: OrganizationWithRole
  tournamentCount: number
}) {
  return (
    <Link
      href={`/organization/${org.slug}`}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm"
    >
      {org.logoUrl ? (
        <Image
          src={org.logoUrl}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-sm font-semibold text-white">
          {org.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-900">{org.name}</p>
          <span
            className={cn(
              'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
              org.role === 'OWNER'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-100 text-slate-600',
            )}
          >
            {org.role === 'OWNER' ? 'Owner' : 'Member'}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          {tournamentCount} {tournamentCount === 1 ? 'tournament' : 'tournaments'}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500" strokeWidth={2} />
    </Link>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  title: string
  description: string
  action: { label: string; href: string }
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
        <Icon className="h-5 w-5 text-slate-400" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 max-w-sm text-xs text-slate-500">{description}</p>
      </div>
      <Link
        href={action.href}
        className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        {action.label}
      </Link>
    </div>
  )
}
