import Link from 'next/link'
import { Users, Upload, FileText, ChevronRight } from 'lucide-react'
import { requireTournamentReadable } from '@/features/tournaments/permissions'
import { getTeamPage } from '@/features/teams/queries/page'
import { PageNavigation } from '@/components/ui/page-navigation'
import type { SearchParams } from '@/lib/pagination'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/empty-state/empty-state'

type TeamWithInst = Awaited<ReturnType<typeof getTeamPage>>['rows'][number]

export default async function TeamsPage({
  params,
  searchParams,
}: {
  params: Promise<{ tournamentId: string }>
  searchParams: Promise<SearchParams>
}) {
  const { tournamentId } = await params
  await requireTournamentReadable(tournamentId)

  const search = await searchParams
  const data = await getTeamPage({ tournamentId }, search)
  const teams = data.rows

  // Group by institution
  const grouped = new Map<string, { institutionName: string; teams: TeamWithInst[] }>()
  for (const t of teams) {
    const key = t.institution?.id ?? '__none__'
    const bucket = grouped.get(key) ?? {
      institutionName: t.institution?.name ?? 'Unaffiliated',
      teams: [],
    }
    bucket.teams.push(t)
    grouped.set(key, bucket)
  }
  const groups = Array.from(grouped.entries())

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams"
        description="Debate teams across every institution registered for this tournament."
        actions={
          teams.length > 0 && (
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
          teams.length > 0 && (
            <span className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground font-normal">
              <span className="tabular-nums font-medium text-foreground">{data.total}</span> total
              across {data.institutionCount} institution{data.institutionCount === 1 ? '' : 's'}
            </span>
          )
        }
      />

      {teams.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" strokeWidth={2} />}
          title="No teams yet"
          description="Import registrations from your Google Form CSV — team, institution, and speaker records will all be created together."
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
              href="/docs/imports/sample-csv"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:border-border-strong hover:bg-surface"
            >
              <FileText className="h-3.5 w-3.5" strokeWidth={2} />
              View sample CSV
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {groups.map(([key, { institutionName, teams: grp }]) => (
            <section key={key}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-[13px] font-semibold tracking-tight text-foreground">
                  {institutionName}
                  <span className="ml-1.5 text-muted-foreground/70 font-normal tabular-nums">
                    {grp.length} of {grp[0].institution._count.teams} on this page
                  </span>
                </h2>
              </div>
              <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
                <ul className="divide-y divide-border">
                  {grp.map((t) => (
                    <li key={t.id}>
                      <Link
                        href={`/tournaments/${tournamentId}/institutions/${t.tournamentInstitutionId}`}
                        className="group flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-surface/60"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-foreground">{t.name}</p>
                          {t.isNovice && (
                            <span className="inline-flex h-5 items-center rounded-md bg-primary/10 px-1.5 text-[10.5px] font-medium text-primary ring-1 ring-inset ring-primary/20">
                              Novice
                            </span>
                          )}
                          {t.warningFlags.length > 0 && (
                            <span className="inline-flex h-5 items-center rounded-md bg-warning/10 px-1.5 text-[10.5px] font-medium text-warning ring-1 ring-inset ring-warning/25">
                              {t.warningFlags.length} flag{t.warningFlags.length === 1 ? '' : 's'}
                            </span>
                          )}
                        </div>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-foreground"
                          strokeWidth={2}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      )}
      <PageNavigation
        pathname={`/tournaments/${tournamentId}/teams`}
        params={search}
        paging={data.paging}
        total={data.total}
      />
    </div>
  )
}
