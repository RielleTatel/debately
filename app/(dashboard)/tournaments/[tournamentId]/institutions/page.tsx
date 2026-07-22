import Link from 'next/link'
import { Building2, Upload, Mail, ChevronRight } from 'lucide-react'
import { requireTournamentReadable } from '@/features/tournaments/permissions'
import { getInstitutionsForTournament } from '@/features/institutions/queries'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { EmptyState } from '@/components/empty-state/empty-state'

export default async function InstitutionsPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>
}) {
  const { tournamentId } = await params
  await requireTournamentReadable(tournamentId)

  const institutions = await getInstitutionsForTournament(tournamentId)
  const [claims, teamCounts, adjCounts] = await Promise.all([
    prisma.institutionClaim.findMany({
      where: { tournamentInstitutionId: { in: institutions.map((i) => i.id) } },
      select: { tournamentInstitutionId: true },
    }),
    prisma.team.groupBy({
      by: ['tournamentInstitutionId'],
      where: { tournamentInstitutionId: { in: institutions.map((i) => i.id) } },
      _count: { _all: true },
    }),
    prisma.adjudicator.groupBy({
      by: ['tournamentInstitutionId'],
      where: { tournamentInstitutionId: { in: institutions.map((i) => i.id) } },
      _count: { _all: true },
    }),
  ])
  const claimedSet = new Set(claims.map((c) => c.tournamentInstitutionId))
  const teamMap = new Map(
    teamCounts.map((t) => [t.tournamentInstitutionId, t._count._all]),
  )
  const adjMap = new Map(
    adjCounts.map((a) => [a.tournamentInstitutionId, a._count._all]),
  )

  const claimed = institutions.filter((i) => claimedSet.has(i.id)).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutions"
        description="Schools, clubs and independent institutions registered for this tournament."
        actions={
          institutions.length > 0 && (
            <Link
              href={`/tournaments/${tournamentId}/imports/new`}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground shadow-xs transition-colors hover:border-border-strong hover:bg-surface"
            >
              <Upload className="h-3.5 w-3.5" strokeWidth={2} />
              Import CSV
            </Link>
          )
        }
        meta={
          institutions.length > 0 && (
            <span className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground font-normal">
              <span className="tabular-nums font-medium text-foreground">
                {institutions.length}
              </span>{' '}
              total
              <span className="text-muted-foreground/40">·</span>
              <span className="tabular-nums text-success">{claimed}</span> claimed
            </span>
          )
        }
      />

      {institutions.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-5 w-5" strokeWidth={2} />}
          title="No institutions yet"
          description="Import registrations from a Google Form CSV to get every institution, their teams, and adjudicators created in one pass."
          primaryAction={
            <Link
              href={`/tournaments/${tournamentId}/imports/new`}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/92"
            >
              <Upload className="h-3.5 w-3.5" strokeWidth={2.5} />
              Import CSV
            </Link>
          }
          secondaryAction={
            <Link
              href="/docs/imports/csv-guide"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:border-border-strong hover:bg-surface"
            >
              View CSV guide
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/60 text-left text-[11.5px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
                <th className="px-4 py-2.5">Institution</th>
                <th className="px-4 py-2.5">Contact</th>
                <th className="px-4 py-2.5 tabular-nums text-right">Teams</th>
                <th className="px-4 py-2.5 tabular-nums text-right">Judges</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {institutions.map((i) => {
                const teams = teamMap.get(i.id) ?? 0
                const adjs = adjMap.get(i.id) ?? 0
                const claimedInst = claimedSet.has(i.id)
                return (
                  <tr key={i.id} className="group transition-colors hover:bg-surface/60">
                    <td className="px-4 py-3">
                      <Link
                        href={`/tournaments/${tournamentId}/institutions/${i.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {i.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {i.contactEmail ? (
                        <a
                          href={`mailto:${i.contactEmail}`}
                          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
                        >
                          <Mail className="h-3.5 w-3.5" strokeWidth={2} />
                          <span className="truncate max-w-[24ch]">{i.contactEmail}</span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">{teams}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">{adjs}</td>
                    <td className="px-4 py-3">
                      {claimedInst ? (
                        <StatusBadge tone="success" dot>Claimed</StatusBadge>
                      ) : (
                        <StatusBadge tone="muted" dot>Unclaimed</StatusBadge>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        href={`/tournaments/${tournamentId}/institutions/${i.id}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/60 transition-colors group-hover:bg-foreground/[0.05] group-hover:text-foreground"
                        aria-label={`Manage ${i.name}`}
                      >
                        <ChevronRight className="h-4 w-4" strokeWidth={2} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
