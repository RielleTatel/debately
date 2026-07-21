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
  const proto = headersList.get('x-forwarded-proto') ?? 'http'
  const host = headersList.get('host') ?? 'localhost:3000'
  const appOrigin = `${proto}://${host}`

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{institution.name}</h1>
        <p className="text-sm text-muted-foreground">Director controls</p>
      </div>
      <PortalControlsPanel
        institutionId={institution.id}
        token={token}
        claim={claim}
        appOrigin={appOrigin}
      />
      <section className="space-y-2">
        <h2 className="text-lg font-medium">Teams</h2>
        <TeamList teams={teams.map((t) => ({ ...t, validationFlags: flagsByTeam.get(t.id) ?? [], participantCount: 0 }))} />
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-medium">Participants</h2>
        <ParticipantList participants={participants as never} />
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-medium">Adjudicators</h2>
        <AdjudicatorList
          adjudicators={adjudicators.map((a) => ({ ...a, institution })) as never}
          showDirectorNotes
        />
      </section>
    </div>
  )
}
