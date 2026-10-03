import Link from 'next/link'
import { Building2, Upload, Mail, ChevronRight, AlertTriangle, XCircle } from 'lucide-react'
import { requireTournamentReadable } from '@/features/tournaments/permissions'
import { getInstitutionPage } from '@/features/institutions/queries/page'
import { PageNavigation } from '@/components/ui/page-navigation'
import { readPage, type SearchParams } from '@/lib/pagination'
import { Suspense } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { EmptyState } from '@/components/empty-state/empty-state'
import { validateRegistrations } from '@/features/tournaments/services/validate-registrations'

export default async function InstitutionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ tournamentId: string }>
  searchParams: Promise<SearchParams>
}) {
  const { tournamentId } = await params
  await requireTournamentReadable(tournamentId)

  const search = await searchParams
  const data = await getInstitutionPage(tournamentId, search)
  const { rows: institutions, claimed } = data

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
              <span className="tabular-nums font-medium text-foreground">{data.total}</span> total
              <span className="text-muted-foreground/40">·</span>
              <span className="tabular-nums text-success">{claimed}</span> claimed
            </span>
          )
        }
      />

      <Suspense
        fallback={
          <div
            aria-label="Checking registration warnings"
            className="h-12 rounded border bg-muted/50"
          />
        }
      >
        <RegistrationWarnings tournamentId={tournamentId} search={search} />
      </Suspense>

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
                const teams = i._count.teams
                const adjs = i._count.adjudicators
                const claimedInst = !!i.claim
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
                        <StatusBadge tone="success" dot>
                          Claimed
                        </StatusBadge>
                      ) : (
                        <StatusBadge tone="muted" dot>
                          Unclaimed
                        </StatusBadge>
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
      <PageNavigation
        pathname={`/tournaments/${tournamentId}/institutions`}
        params={search}
        paging={data.paging}
        total={data.total}
      />
    </div>
  )
}

async function RegistrationWarnings({
  tournamentId,
  search,
}: {
  tournamentId: string
  search: SearchParams
}) {
  const flags = await validateRegistrations(tournamentId)
  const paging = readPage({ page: search.warningsPage, pageSize: search.warningsPageSize })
  return (
    <details open={search.warningsPage !== undefined} className="rounded border">
      <summary className="flex h-12 cursor-pointer items-center px-4 text-sm">
        Registration warnings ({flags.length})
      </summary>
      {flags.length > 0 && (
        <div className="space-y-2">
          {flags.slice(paging.skip, paging.skip + paging.pageSize).map((f, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 rounded-md border px-3.5 py-2.5 text-sm ${
                f.severity === 'error'
                  ? 'border-red-200 bg-red-50 text-red-800'
                  : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}
            >
              {f.severity === 'error' ? (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              )}
              <span>{f.message}</span>
            </div>
          ))}
          <PageNavigation
            pathname={`/tournaments/${tournamentId}/institutions`}
            params={search}
            paging={paging}
            total={flags.length}
            pageKey="warningsPage"
            pageSizeKey="warningsPageSize"
          />
        </div>
      )}
    </details>
  )
}
