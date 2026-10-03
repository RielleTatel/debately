import { requireInstitutionRep } from '@/features/portal/permissions'
import {
  getParticipantCountForInstitution,
  getParticipantPage,
} from '@/features/participants/queries/page'
import { ParticipantList } from '@/features/participants/components/participant-list'
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
  const data = getParticipantPage(institutionId, search)
  const total = await getParticipantCountForInstitution(institutionId)
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-xl font-semibold">Participants</h1>
      <Suspense
        fallback={
          <RosterSkeleton kind="participants" rows={pageRowCount(total, readPage(search))} />
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
  data: ReturnType<typeof getParticipantPage>
}) {
  const data = await pending
  return (
    <div className="space-y-2">
      <ParticipantList
        participants={data.rows}
        editBase={`/portal/${institutionId}/participants`}
      />
      <PageNavigation
        pathname={`/portal/${institutionId}/participants`}
        params={search}
        paging={data.paging}
        total={data.total}
      />
    </div>
  )
}
