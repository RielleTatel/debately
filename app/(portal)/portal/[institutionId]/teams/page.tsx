import { requireInstitutionRep } from '@/features/portal/permissions'
import { getTeamCountForInstitution, getTeamPage } from '@/features/teams/queries/page'
import { TeamList } from '@/features/teams/components/team-list'
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
  const data = getTeamPage({ institutionId }, search)
  const total = await getTeamCountForInstitution(institutionId)
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-xl font-semibold">Teams</h1>
      <Suspense
        fallback={<RosterSkeleton kind="teams" rows={pageRowCount(total, readPage(search))} />}
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
  data: ReturnType<typeof getTeamPage>
}) {
  const data = await pending
  return (
    <div className="space-y-2">
      <TeamList
        teams={data.rows.map((row) => ({ ...row, participantCount: row._count.participants }))}
        editBase={`/portal/${institutionId}/teams`}
      />
      <PageNavigation
        pathname={`/portal/${institutionId}/teams`}
        params={search}
        paging={data.paging}
        total={data.total}
      />
    </div>
  )
}
