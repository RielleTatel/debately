import { headers } from 'next/headers'
import { requireTournamentDirector } from '@/features/tournaments/permissions'
import { getInstitutionById } from '@/features/institutions/queries'
import { getPortalTokenByInstitution } from '@/features/portal/queries'
import { getTeamsForInstitution } from '@/features/teams/queries'
import { getParticipantsForInstitution } from '@/features/participants/queries'
import { getAdjudicatorsForInstitution } from '@/features/adjudicators/queries'
import { prisma } from '@/lib/prisma'
import { PortalControlsPanel } from '@/features/portal/components/portal-controls-panel'
import { TeamList } from '@/features/teams/components/team-list'
import { ParticipantList } from '@/features/participants/components/participant-list'
import { AdjudicatorList } from '@/features/adjudicators/components/adjudicator-list'
import { notFound } from 'next/navigation'

export default async function InstitutionDetailPage({
  params,
}: { params: Promise<{ tournamentId: string; institutionId: string }> }) {
  const { tournamentId, institutionId } = await params
  await requireTournamentDirector(tournamentId)
  const institution = await getInstitutionById(institutionId)
  if (!institution) notFound()

  const [token, claim, teams, participants, adjudicators, headersList] = await Promise.all([
    getPortalTokenByInstitution(institutionId),
    prisma.institutionClaim.findUnique({ where: { tournamentInstitutionId: institutionId } }),
    getTeamsForInstitution(institutionId),
    getParticipantsForInstitution(institutionId),
    getAdjudicatorsForInstitution(institutionId),
    headers(),
  ])
  const flags = await prisma.teamValidationFlag.findMany({
    where: { teamId: { in: teams.map((t) => t.id) } },
  })
  const flagsByTeam = new Map<string, typeof flags>()
  for (const f of flags) {
    const arr = flagsByTeam.get(f.teamId) ?? []
    arr.push(f); flagsByTeam.set(f.teamId, arr)
  }
  const participantCountByTeam = new Map<string, number>()
  for (const p of participants) {
    if (p.teamId) participantCountByTeam.set(p.teamId, (participantCountByTeam.get(p.teamId) ?? 0) + 1)
  }
  const proto = headersList.get('x-forwarded-proto') ?? 'http'
  const host = headersList.get('host') ?? 'localhost:3000'
  const appOrigin = `${proto}://${host}`

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{institution.name}</h1>
        <p className="text-sm text-muted-foreground">Director controls</p>
      </div>

      {(institution.teamsIntended != null || institution.adjudicatorsIntended != null || institution.contactName || institution.contactEmail || institution.contactPhone) && (
        <div className="rounded-lg border border-border bg-card px-5 py-4 shadow-xs">
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Registration details</h2>
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
                <dd><a href={`mailto:${institution.contactEmail}`} className="font-medium text-primary hover:underline">{institution.contactEmail}</a></dd>
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
      <section className="space-y-2">
        <h2 className="text-lg font-medium">Teams</h2>
        <TeamList teams={teams.map((t) => ({ ...t, validationFlags: flagsByTeam.get(t.id) ?? [], participantCount: participantCountByTeam.get(t.id) ?? 0 }))} />
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-medium">Participants</h2>
        <ParticipantList participants={participants} />
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-medium">Adjudicators</h2>
        <AdjudicatorList adjudicators={adjudicators.map((a) => ({ ...a, institution }))} />
      </section>
    </div>
  )
}
