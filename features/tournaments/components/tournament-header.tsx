import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  MapPin,
  Users,
  ExternalLink,
  Settings,
  Megaphone,
} from 'lucide-react'
import { StatusBadge } from '@/components/ui/status-badge'
import type { Tournament, TournamentStatus } from '@prisma/client'

type Props = {
  tournament: Tournament
  isDirector: boolean
  filledSlots?: number
}

const statusMap: Record<
  TournamentStatus,
  { label: string; tone: 'muted' | 'info' | 'success' | 'neutral' }
> = {
  DRAFT: { label: 'Draft', tone: 'muted' },
  ACTIVE: { label: 'Active', tone: 'success' },
  COMPLETED: { label: 'Completed', tone: 'neutral' },
  ARCHIVED: { label: 'Archived', tone: 'muted' },
}

function fmtRange(start: Date, end: Date) {
  const sameMonth =
    start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()
  const sameDay = sameMonth && start.getDate() === end.getDate()
  const monthDay = (d: Date) =>
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  if (sameDay) {
    return `${monthDay(start)}, ${start.getFullYear()}`
  }
  if (sameMonth) {
    return `${start.toLocaleDateString(undefined, { month: 'short' })} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`
  }
  return `${monthDay(start)} – ${monthDay(end)}, ${end.getFullYear()}`
}

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000)
}

export function TournamentHeader({ tournament, isDirector, filledSlots }: Props) {
  const status = statusMap[tournament.status]
  const daysToStart = daysUntil(tournament.startDate)
  const started = daysToStart <= 0
  const initial = tournament.name.charAt(0).toUpperCase()

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          {/* Left: identity */}
          <div className="flex min-w-0 items-start gap-4">
            {tournament.logoUrl ? (
              <Image
                src={tournament.logoUrl}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-inset ring-border"
              />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-foreground text-lg font-semibold text-background">
                {initial}
              </span>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[22px] font-semibold tracking-tight text-foreground leading-tight truncate">
                  {tournament.name}
                </h1>
                <StatusBadge tone={status.tone} dot>{status.label}</StatusBadge>
                {tournament.registrationOpen && (
                  <StatusBadge tone="info" dot>Registration open</StatusBadge>
                )}
                {tournament.portalActive && (
                  <StatusBadge tone="neutral">Portal live</StatusBadge>
                )}
                {tournament.publicPageEnabled && (
                  <StatusBadge tone="neutral">Public page</StatusBadge>
                )}
              </div>
              <dl className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
                  <dt className="sr-only">Dates</dt>
                  <dd className="tabular-nums">
                    {fmtRange(tournament.startDate, tournament.endDate)}
                  </dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                  <dt className="sr-only">Venue</dt>
                  <dd className="truncate max-w-[24ch]">{tournament.venue}</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" strokeWidth={2} />
                  <dt className="sr-only">Capacity</dt>
                  <dd className="tabular-nums">
                    {typeof filledSlots === 'number' ? (
                      <>
                        {filledSlots}
                        <span className="text-muted-foreground/60">/{tournament.maxTeamSlots}</span> teams
                      </>
                    ) : (
                      <>{tournament.maxTeamSlots} team slots</>
                    )}
                  </dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/60" />
                  <dd className="tabular-nums">
                    {started
                      ? tournament.status === 'COMPLETED'
                        ? 'Concluded'
                        : 'In progress'
                      : daysToStart === 1
                        ? 'Starts tomorrow'
                        : `Starts in ${daysToStart} days`}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right: primary actions */}
          <div className="flex flex-wrap items-center gap-2">
            {tournament.publicPageEnabled && (
              <Link
                href={`/t/${tournament.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground shadow-xs transition-colors hover:border-border-strong hover:bg-surface"
              >
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
                Public page
              </Link>
            )}
            <Link
              href={`/tournaments/${tournament.id}/announcements`}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground shadow-xs transition-colors hover:border-border-strong hover:bg-surface"
            >
              <Megaphone className="h-3.5 w-3.5" strokeWidth={2} />
              Announce
            </Link>
            {isDirector && (
              <Link
                href={`/tournaments/${tournament.id}/settings`}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground shadow-xs transition-colors hover:border-border-strong hover:bg-surface"
              >
                <Settings className="h-3.5 w-3.5" strokeWidth={2} />
                Settings
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
