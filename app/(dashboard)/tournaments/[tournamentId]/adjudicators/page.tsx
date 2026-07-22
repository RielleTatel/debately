import Link from 'next/link'
import { Upload } from 'lucide-react'
import { requireTournamentDirector } from '@/features/tournaments/permissions'
import { getAdjudicatorsForTournament } from '@/features/adjudicators/queries'
import { AdjudicatorList } from '@/features/adjudicators/components/adjudicator-list'
import { PageHeader } from '@/components/ui/page-header'

export default async function AdjudicatorsPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>
}) {
  const { tournamentId } = await params
  await requireTournamentDirector(tournamentId)
  const adjudicators = await getAdjudicatorsForTournament(tournamentId)
  const active = adjudicators.filter((a) => a.status !== 'WITHDRAWN').length
  const withdrawn = adjudicators.length - active

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

      <AdjudicatorList adjudicators={adjudicators as never} showDirectorNotes />
    </div>
  )
}
