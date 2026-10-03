import { requireInstitutionRep } from '@/features/portal/permissions'
import {
  getAdjudicatorCountForInstitution,
  getAdjudicatorPage,
  readAdjudicatorStatus,
} from '@/features/adjudicators/queries/page'
import { AdjudicatorList } from '@/features/adjudicators/components/adjudicator-list'
import { PageNavigation } from '@/components/ui/page-navigation'
import { pageRowCount, readPage, type SearchParams } from '@/lib/pagination'
import { RosterSkeleton } from '@/components/ui/roster-skeleton'
import { Suspense } from 'react'

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ institutionId: string }>
  searchParams: Promise<SearchParams>
}) {
  const { institutionId } = await params
  await requireInstitutionRep(institutionId)
  const search = await searchParams
  const data = getAdjudicatorPage({ institutionId }, search)
  const total = await getAdjudicatorCountForInstitution(
    institutionId,
    readAdjudicatorStatus(search),
  )
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-xl font-semibold">Adjudicators</h1>
      <Suspense
        fallback={
          <RosterSkeleton kind="adjudicators" rows={pageRowCount(total, readPage(search))} />
        }
      >
        <Roster institutionId={institutionId} search={search} data={data} />
      </Suspense>
    </div>
  )
}

async function Roster({
  institutionId,
  search,
  data: pending,
}: {
  institutionId: string
  search: SearchParams
  data: ReturnType<typeof getAdjudicatorPage>
}) {
  const data = await pending
  return (
    <div className="space-y-2">
      <AdjudicatorList
        adjudicators={data.rows}
        editBase={`/portal/${institutionId}/adjudicators`}
      />
      <PageNavigation
        pathname={`/portal/${institutionId}/adjudicators`}
        params={search}
        paging={data.paging}
        total={data.total}
      />
    </div>
  )
}
