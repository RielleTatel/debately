import Link from 'next/link'
import Image from 'next/image'
import { Plus, Building2, Trophy, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getMyOrganizations } from '@/features/organizations/queries'
import { listTournamentsForCurrentUser } from '@/features/tournaments/queries'
import { SectionHeader } from '@/components/ui/section-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { MetricCard } from '@/components/ui/metric-card'
import { EmptyState } from '@/components/empty-state/empty-state'
import type { TournamentListItem, TournamentStatus } from '@/features/tournaments/types'
import type { OrganizationWithRole } from '@/features/organizations/types'

const STATUS_TONE: Record<TournamentStatus, { label: string; tone: 'muted' | 'success' | 'neutral' }> = {
  DRAFT: { label: 'Draft', tone: 'muted' },
  ACTIVE: { label: 'Active', tone: 'success' },
  COMPLETED: { label: 'Completed', tone: 'neutral' },
  ARCHIVED: { label: 'Archived', tone: 'muted' },
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

  const activeCount = tournaments.filter((t) => t.status === 'ACTIVE').length
  const upcomingCount = tournaments.filter(
    (t) => t.status === 'DRAFT' || (t.status === 'ACTIVE' && t.startDate.getTime() > Date.now()),
  ).length
  const upcoming = tournaments
    .filter((t) => t.status !== 'COMPLETED' && t.status !== 'ARCHIVED')
    .slice(0, 6)

  return (
    <div className="space-y-8">
      {/* Metrics summary — cross-workspace */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard
          label="Tournaments"
          value={tournaments.length}
          icon={<Trophy className="h-3.5 w-3.5" strokeWidth={2} />}
          href="/tournaments"
        />
        <MetricCard
          label="Active now"
          value={activeCount}
          hint="Currently running"
        />
        <MetricCard
          label="Upcoming"
          value={upcomingCount}
          hint="Draft or scheduled"
        />
        <MetricCard
          label="Organizations"
          value={orgs.length}
          icon={<Building2 className="h-3.5 w-3.5" strokeWidth={2} />}
          href="/organization"
        />
      </div>

      {/* Upcoming tournaments */}
      <section className="space-y-3">
        <SectionHeader
          title="Upcoming & active tournaments"
          description="Jump straight into a workspace."
          action={
            canCreateTournament ? (
              <Link
                href={`/tournaments/create?orgId=${firstOwnedOrg.id}`}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-2.5 text-[13px] font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/92"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                New tournament
              </Link>
            ) : null
          }
        />

        {upcoming.length === 0 ? (
          <EmptyState
            icon={<Trophy className="h-5 w-5" strokeWidth={2} />}
            title="No upcoming tournaments"
            description={
              canCreateTournament
                ? 'Create your first tournament to start inviting institutions and teams.'
                : 'Join or create an organization first.'
            }
            primaryAction={
              canCreateTournament ? (
                <Link
                  href={`/tournaments/create?orgId=${firstOwnedOrg.id}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/92"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                  New tournament
                </Link>
              ) : (
                <Link
                  href="/organization/new"
                  className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/92"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Create organization
                </Link>
              )
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        )}
      </section>

      {/* Organizations */}
      <section className="space-y-3">
        <SectionHeader
          title="Your organizations"
          description="Groups you own or belong to."
          action={
            <Link
              href="/organization/new"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-[13px] font-medium text-foreground transition-colors hover:border-border-strong hover:bg-surface"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              New organization
            </Link>
          }
        />
        {orgs.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-5 w-5" strokeWidth={2} />}
            title="No organizations yet"
            description="Create an organization to invite teammates and start hosting tournaments together."
            primaryAction={
              <Link
                href="/organization/new"
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/92"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                Create organization
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
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
    </div>
  )
}

export function DashboardBodySkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4 shadow-xs">
            <div className="animate-pulse rounded bg-foreground/[0.06] h-3 w-20" />
            <div className="mt-3 animate-pulse rounded bg-foreground/[0.06] h-6 w-14" />
          </div>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="animate-pulse rounded-md bg-foreground/[0.06] h-9 w-9" />
              <div className="space-y-2 flex-1">
                <div className="animate-pulse rounded bg-foreground/[0.06] h-4 w-3/4" />
                <div className="animate-pulse rounded bg-foreground/[0.06] h-3 w-1/2" />
              </div>
            </div>
            <div className="mt-4 border-t border-border pt-3 flex items-center justify-between">
              <div className="animate-pulse rounded bg-foreground/[0.06] h-4 w-16" />
              <div className="animate-pulse rounded bg-foreground/[0.06] h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TournamentCard({ tournament }: { tournament: TournamentListItem }) {
  const status = STATUS_TONE[tournament.status]
  return (
    <Link
      href={`/tournaments/${tournament.id}`}
      className="group flex flex-col rounded-lg border border-border bg-card p-4 shadow-xs transition-colors hover:border-border-strong hover:bg-surface"
    >
      <div className="flex items-start gap-3">
        {tournament.logoUrl ? (
          <Image
            src={tournament.logoUrl}
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-md object-cover ring-1 ring-inset ring-border"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-foreground text-sm font-semibold text-background">
            {tournament.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium tracking-tight text-foreground">
            {tournament.name}
          </p>
          <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
            {tournament.orgName}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <StatusBadge tone={status.tone} dot>{status.label}</StatusBadge>
        <span className="text-[12px] text-muted-foreground tabular-nums">
          {formatDateRange(tournament.startDate, tournament.endDate)}
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
      className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-xs transition-colors hover:border-border-strong hover:bg-surface"
    >
      {org.logoUrl ? (
        <Image
          src={org.logoUrl}
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 rounded-md object-cover ring-1 ring-inset ring-border"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
          {org.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[14px] font-medium tracking-tight text-foreground">
            {org.name}
          </p>
          <StatusBadge tone={org.role === 'OWNER' ? 'info' : 'muted'}>
            {org.role === 'OWNER' ? 'Owner' : 'Member'}
          </StatusBadge>
        </div>
        <p className="mt-0.5 text-[12.5px] text-muted-foreground">
          {tournamentCount} tournament{tournamentCount === 1 ? '' : 's'}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-foreground transition-colors" strokeWidth={2} />
    </Link>
  )
}
