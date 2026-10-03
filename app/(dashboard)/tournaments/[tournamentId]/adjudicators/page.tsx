import Link from 'next/link'
import { Upload } from 'lucide-react'
import { requireTournamentDirector } from '@/features/tournaments/permissions'
import { getAdjudicatorPage } from '@/features/adjudicators/queries/page'
import { PageNavigation } from '@/components/ui/page-navigation'
import type { SearchParams } from '@/lib/pagination'
import { AdjudicatorList } from '@/features/adjudicators/components/adjudicator-list'
import { PageHeader } from '@/components/ui/page-header'

export default async function AdjudicatorsPage({
  params,
  searchParams,
}: {
  params: Promise<{ tournamentId: string }>
  searchParams: Promise<SearchParams>
}) {
  const { tournamentId } = await params
  await requireTournamentDirector(tournamentId)
  const search = await searchParams
  const data = await getAdjudicatorPage({ tournamentId }, search)
  const { rows: adjudicators, active, withdrawn } = data

  return (
    <div className="space-y-6">
      <PageHeader
        title="Adjudicators"
        description="Every judge across every institution, plus independents."
        actions={
          adjudicators.length > 0 && (
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
          adjudicators.length > 0 && (
            <span className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground font-normal">
              <span className="tabular-nums font-medium text-success">{active}</span> active
              {withdrawn > 0 && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="tabular-nums text-destructive">{withdrawn}</span> withdrawn
                </>
              )}
            </span>
          )
        }
      />

      <form className="flex items-center gap-2" method="get">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          defaultValue={typeof search.status === 'string' ? search.status : ''}
          className="rounded border p-2"
        >
          <option value="">All</option>
          <option value="ACTIVE">Active</option>
          <option value="WITHDRAWN">Withdrawn</option>
        </select>
        <button type="submit" className="underline">
          Filter
        </button>
      </form>
      <AdjudicatorList adjudicators={adjudicators} />
      <PageNavigation
        pathname={`/tournaments/${tournamentId}/adjudicators`}
        params={search}
        paging={data.paging}
        total={data.total}
      />
    </div>
  )
}
