import Link from 'next/link'
import { requireInstitutionRep } from '@/features/portal/permissions'
import { getTeamsForInstitution } from '@/features/teams/queries'
import { getParticipantsForInstitution } from '@/features/participants/queries'
import { getAdjudicatorsForInstitution } from '@/features/adjudicators/queries'
import { prisma } from '@/lib/prisma'
import { InstitutionDashboard } from '@/features/portal/components/institution-dashboard'

export default async function InstitutionDashboardPage({
  params,
}: { params: Promise<{ institutionId: string }> }) {
  const { institutionId } = await params
  const { institution } = await requireInstitutionRep(institutionId)
  const [teams, participants, adjudicators] = await Promise.all([
    getTeamsForInstitution(institutionId),
    getParticipantsForInstitution(institutionId),
    getAdjudicatorsForInstitution(institutionId),
  ])
  const flagged = await prisma.teamValidationFlag.findMany({
    where: { teamId: { in: teams.map((t) => t.id) } },
    select: { teamId: true },
  })
  const flaggedTeamIds = new Set(flagged.map((f) => f.teamId))

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{institution.name}</h1>
          <p className="text-sm text-muted-foreground">Institution portal</p>
        </div>
        <Link href={`/portal/${institution.id}/profile`} className="text-sm underline">Edit profile</Link>
      </div>
      <InstitutionDashboard
        institution={institution}
        summary={{
          teamsTotal: teams.length,
          teamsWithIssues: [...flaggedTeamIds].length,
          participantsTotal: participants.length,
          adjudicatorsTotal: adjudicators.length,
        }}
      />
    </div>
  )
}
