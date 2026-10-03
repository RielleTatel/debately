import { getImportHistoryPage } from '@/features/imports/queries/imports'
import { ImportHistoryList } from './import-history-list'
import { PageNavigation } from '@/components/ui/page-navigation'
import type { SearchParams } from '@/lib/pagination'

export async function ImportHistoryPanel({
  tournamentId,
  search = {},
}: {
  tournamentId: string
  search?: SearchParams
}) {
  const data = await getImportHistoryPage(tournamentId, search)
  return (
    <>
      <ImportHistoryList tournamentId={tournamentId} imports={data.rows} />
      <PageNavigation
        pathname={`/tournaments/${tournamentId}/imports`}
        params={search}
        paging={data.paging}
        total={data.total}
      />
    </>
  )
}

export function ImportHistorySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded bg-muted h-14 w-full" />
      ))}
    </div>
  )
}
