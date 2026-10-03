import { Suspense } from 'react'
import { connection } from 'next/server'
import { PageNavigation } from '@/components/ui/page-navigation'
import { readPage, type SearchParams } from '@/lib/pagination'
import type { CSSProperties } from 'react'
import { notFound } from 'next/navigation'
import {
  getPublicTournamentBySlug,
  getPublicInstitutions,
} from '@/features/public/queries/tournament'
import {
  InfoBlock,
  OrganizerBlock,
  ScheduleTable,
  InstitutionsList,
  DocsList,
  ContactCard,
} from '@/features/public/components'

export default async function PublicTournamentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<SearchParams>
}) {
  await connection()
  const { slug } = await params
  const t = await getPublicTournamentBySlug(slug)
  if (!t) notFound()
  const search = await searchParams
  const size = readPage(search).pageSize
  const institutionsSpace = {
    '--institutions-mobile': `${76 + Math.ceil(size / 2) * 68}px`,
    '--institutions-desktop': `${76 + Math.ceil(size / 3) * 68}px`,
  } as CSSProperties
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <InfoBlock tournament={t} />
      <OrganizerBlock org={t.organization} contacts={t.contacts} />
      <ScheduleTable entries={t.schedule} />
      <div
        style={institutionsSpace}
        className="min-h-[var(--institutions-mobile)] md:min-h-[var(--institutions-desktop)]"
      >
        <Suspense
          fallback={
            <div aria-label="Loading participating institutions">
              <h2 className="text-lg font-semibold mb-3">Participating institutions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Array.from({ length: size }, (_, index) => (
                  <div key={index} className="h-[60px] animate-pulse rounded border bg-muted/50" />
                ))}
              </div>
            </div>
          }
        >
          <Institutions tournamentId={t.id} slug={slug} search={search} />
        </Suspense>
      </div>
      <DocsList assets={t.publicAssets} />
      <ContactCard slug={slug} contacts={t.contacts} />
    </div>
  )
}

async function Institutions({
  tournamentId,
  slug,
  search,
}: {
  tournamentId: string
  slug: string
  search: SearchParams
}) {
  const data = await getPublicInstitutions(tournamentId, search)
  return (
    <div>
      <InstitutionsList institutions={data.rows} />
      <PageNavigation
        pathname={`/t/${slug}`}
        params={search}
        paging={data.paging}
        total={data.total}
      />
    </div>
  )
}
