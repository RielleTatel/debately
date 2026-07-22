import Link from 'next/link'
import Image from 'next/image'
import { Plus, Trophy, ArrowUpRight, FileText } from 'lucide-react'
import { listTournamentsForCurrentUser } from '@/features/tournaments/queries'
import { getMyOrganizations } from '@/features/organizations/queries'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { EmptyState } from '@/components/empty-state/empty-state'
import { cn } from '@/lib/utils'
import type { TournamentStatus } from '@prisma/client'

const statusToneMap: Record<
  TournamentStatus,
  { label: string; tone: 'muted' | 'success' | 'neutral' | 'info' }
> = {
  DRAFT: { label: 'Draft', tone: 'muted' },
  ACTIVE: { label: 'Active', tone: 'success' },
  COMPLETED: { label: 'Completed', tone: 'neutral' },
  ARCHIVED: { label: 'Archived', tone: 'muted' },
}

function fmtDateRange(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const y = start.getFullYear() === end.getFullYear() ? '' : ` ${end.getFullYear()}`
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}, ${end.getFullYear()}${y ? '' : ''}`
}

export default async function TournamentsPage() {
  const [tournaments, orgs] = await Promise.all([
    listTournamentsForCurrentUser(),
    getMyOrganizations(),
  ])

  const firstOwnedOrg = orgs.find((o) => o.role === 'OWNER') ?? orgs[0]
  const canCreate = !!firstOwnedOrg
  const createHref = firstOwnedOrg ? `/tournaments/create?orgId=${firstOwnedOrg.id}` : '#'

  const active = tournaments.filter((t) => t.status === 'ACTIVE' || t.status === 'DRAFT')
  const past = tournaments.filter((t) => t.status === 'COMPLETED' || t.status === 'ARCHIVED')

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
      <PageHeader
        title="Tournaments"
        description="Every tournament you organize or participate in as staff."
        actions={
          canCreate ? (
            <Link
              href={createHref}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/92"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              New tournament
            </Link>
          ) : null
        }
      />

      {tournaments.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-5 w-5" strokeWidth={2} />}
          title="No tournaments yet"
          description={
            canCreate
              ? 'Create your first tournament to start managing registration, participants and payments.'
              : 'Join or create an organization first, then set up a tournament.'
          }
          primaryAction={
            canCreate ? (
              <Link
                href={createHref}
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
          secondaryAction={
            <Link
              href="/docs/getting-started"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:border-border-strong hover:bg-surface"
            >
              <FileText className="h-3.5 w-3.5" strokeWidth={2} />
              Getting started
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <TournamentGrid title="Active & Draft" items={active} />
          )}
          {past.length > 0 && (
            <TournamentGrid title="Completed & Archived" items={past} muted />
          )}
        </div>
      )}
    </div>
  )
}

function TournamentGrid({
  title,
  items,
  muted,
}: {
  title: string
  items: Awaited<ReturnType<typeof listTournamentsForCurrentUser>>
  muted?: boolean
}) {
  return (
    <section>
      <h2 className="mb-3 text-[13px] font-semibold tracking-tight text-foreground">
        {title}
        <span className="ml-2 text-muted-foreground/70 font-normal tabular-nums">
          {items.length}
        </span>
      </h2>
      <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', muted && 'opacity-95')}>
        {items.map((t) => {
          const status = statusToneMap[t.status]
          const initial = t.name.charAt(0).toUpperCase()
          return (
            <Link
              key={t.id}
              href={`/tournaments/${t.id}`}
              className="group flex flex-col rounded-lg border border-border bg-card p-4 shadow-xs transition-colors hover:border-border-strong hover:bg-surface"
            >
              <div className="flex items-start gap-3">
                {t.logoUrl ? (
                  <Image
                    src={t.logoUrl}
                    alt=""
                    width={36}
                    height={36}
                    className="h-9 w-9 shrink-0 rounded-md object-cover ring-1 ring-inset ring-border"
                  />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-foreground text-sm font-semibold text-background">
                    {initial}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-[14px] font-medium tracking-tight text-foreground">
                      {t.name}
                    </p>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" strokeWidth={2} />
                  </div>
                  <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
                    {t.orgName}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <StatusBadge tone={status.tone} dot>{status.label}</StatusBadge>
                <span className="text-[12px] text-muted-foreground tabular-nums">
                  {fmtDateRange(t.startDate, t.endDate)}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
