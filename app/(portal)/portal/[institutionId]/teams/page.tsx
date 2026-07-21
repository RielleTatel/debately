import { requireInstitutionRep } from '@/features/portal/permissions'
import { prisma } from '@/lib/prisma'
import { TeamList } from '@/features/teams/components/team-list'
import { TeamEditForm } from '@/features/teams/components/team-edit-form'

export default async function TeamsPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const { institutionId } = await params
  const { institution } = await requireInstitutionRep(institutionId)
  const teams = await prisma.team.findMany({
    where: { tournamentInstitutionId: institution.id },
    orderBy: { name: 'asc' },
    include: { validationFlags: true, _count: { select: { participants: true } } },
  })
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-xl font-semibold">Teams</h1>
      <TeamList teams={teams.map((t) => ({ ...t, participantCount: t._count.participants }))} />
      <div className="space-y-3">
        {teams.map((t) => <div key={t.id} id={`edit-${t.id}`}><TeamEditForm team={t} /></div>)}
      </div>
    </div>
  )
}
