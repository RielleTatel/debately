import { headers } from 'next/headers'
import { requireTournamentDirector } from '@/features/tournaments/permissions'
import { getInstitutionWithRosterCountsById } from '@/features/institutions/queries'
import { getPortalTokenByInstitution } from '@/features/portal/queries'
import { getTeamPage } from '@/features/teams/queries/page'
import { PageNavigation } from '@/components/ui/page-navigation'
import { pageRowCount, readPage, type SearchParams } from '@/lib/pagination'
import { RosterSkeleton } from '@/components/ui/roster-skeleton'
import { Suspense } from 'react'
import { getParticipantPage } from '@/features/participants/queries/page'
import { getAdjudicatorPage } from '@/features/adjudicators/queries/page'
import { prisma } from '@/lib/prisma'
import { PortalControlsPanel } from '@/features/portal/components/portal-controls-panel'
import { TeamList } from '@/features/teams/components/team-list'
import { ParticipantList } from '@/features/participants/components/participant-list'
import { AdjudicatorList } from '@/features/adjudicators/components/adjudicator-list'
import { notFound } from 'next/navigation'

export default async function InstitutionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ tournamentId: string; institutionId: string }>
  searchParams: Promise<SearchParams>
}) {
  const { tournamentId, institutionId } = await params
  await requireTournamentDirector(tournamentId)
  const institution = await getInstitutionWithRosterCountsById(institutionId)
  if (!institution || institution.tournamentId !== tournamentId) notFound()
  const search = await searchParams

  const [token, claim, headersList] = await Promise.all([
    getPortalTokenByInstitution(institutionId),
    prisma.institutionClaim.findUnique({ where: { tournamentInstitutionId: institutionId } }),
    headers(),
  ])
  const proto = headersList.get('x-forwarded-proto') ?? 'http'
  const host = headersList.get('host') ?? 'localhost:3000'
  const appOrigin = `${proto}://${host}`

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{institution.name}</h1>
        <p className="text-sm text-muted-foreground">Director controls</p>
      </div>

      {(institution.teamsIntended != null ||
        institution.adjudicatorsIntended != null ||
        institution.contactName ||
        institution.contactEmail ||
        institution.contactPhone) && (
        <div className="rounded-lg border border-border bg-card px-5 py-4 shadow-xs">
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
            Registration details
          </h2>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
            {institution.teamsIntended != null && (
              <>
                <dt className="text-muted-foreground">Teams intended</dt>
                <dd className="font-medium tabular-nums">{institution.teamsIntended}</dd>
              </>
            )}
            {institution.adjudicatorsIntended != null && (
              <>
                <dt className="text-muted-foreground">Adjudicators intended</dt>
                <dd className="font-medium tabular-nums">{institution.adjudicatorsIntended}</dd>
              </>
            )}
            {institution.contactName && (
              <>
                <dt className="text-muted-foreground">Representative</dt>
                <dd className="font-medium">{institution.contactName}</dd>
              </>
            )}
            {institution.contactEmail && (
              <>
                <dt className="text-muted-foreground">Email</dt>
                <dd>
                  <a
                    href={`mailto:${institution.contactEmail}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {institution.contactEmail}
                  </a>
                </dd>
              </>
            )}
            {institution.contactPhone && (
              <>
                <dt className="text-muted-foreground">Contact</dt>
                <dd className="font-medium">{institution.contactPhone}</dd>
              </>
            )}
          </dl>
        </div>
      )}

      <PortalControlsPanel
        institutionId={institution.id}
        token={token}
        claim={claim}
        appOrigin={appOrigin}
      />
      {(['teams', 'participants', 'adjudicators'] as const).map((kind) => (
        <section key={kind} className="space-y-2">
          <h2 className="text-lg font-medium capitalize">{kind}</h2>
          <Suspense
            fallback={
              <RosterSkeleton
                kind={kind}
                rows={pageRowCount(
                  institution._count[kind],
                  readPage({
                    page: search[`${kind}Page`],
                    pageSize: search[`${kind}PageSize`],
                  }),
                )}
              />
            }
          >
            <Roster
              kind={kind}
              institutionId={institutionId}
              tournamentId={tournamentId}
              search={search}
            />
          </Suspense>
        </section>
      ))}
    </div>
  )
}

async function Roster({
  kind,
  institutionId,
  tournamentId,
  search,
}: {
  kind: 'teams' | 'participants' | 'adjudicators'
  institutionId: string
  tournamentId: string
  search: SearchParams
}) {
  const params = { ...search, page: search[`${kind}Page`], pageSize: search[`${kind}PageSize`] }
  const pathname = `/tournaments/${tournamentId}/institutions/${institutionId}`
  const navigation = (data: { total: number; paging: import('@/lib/pagination').PageInput }) => (
    <PageNavigation
      pathname={pathname}
      params={search}
      paging={data.paging}
      total={data.total}
      pageKey={`${kind}Page`}
      pageSizeKey={`${kind}PageSize`}
    />
  )
  if (kind === 'teams') {
    const data = await getTeamPage({ institutionId }, params)
    return (
      <div className="space-y-2">
        <TeamList
          teams={data.rows.map((t) => ({ ...t, participantCount: t._count.participants }))}
        />
        {navigation(data)}
      </div>
    )
  }
  if (kind === 'participants') {
    const data = await getParticipantPage(institutionId, params)
    return (
      <div className="space-y-2">
        <ParticipantList participants={data.rows} />
        {navigation(data)}
      </div>
    )
  }
  const data = await getAdjudicatorPage({ institutionId }, params)
  return (
    <div className="space-y-2">
      <AdjudicatorList adjudicators={data.rows} />
      {navigation(data)}
    </div>
  )
}
