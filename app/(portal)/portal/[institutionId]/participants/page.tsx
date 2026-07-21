import { requireInstitutionRep } from '@/features/portal/permissions'
import { prisma } from '@/lib/prisma'
import { ParticipantList } from '@/features/participants/components/participant-list'
import { ParticipantEditForm } from '@/features/participants/components/participant-edit-form'

export default async function ParticipantsPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const { institutionId } = await params
  const { institution } = await requireInstitutionRep(institutionId)
  const participants = await prisma.participant.findMany({
    where: { tournamentInstitutionId: institution.id },
    orderBy: { displayName: 'asc' }, include: { team: true },
  })
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-xl font-semibold">Participants</h1>
      <ParticipantList participants={participants} />
      <div className="space-y-3">
        {participants.map((p) => (
          <div key={p.id} id={`edit-${p.id}`}><ParticipantEditForm participant={p} /></div>
        ))}
      </div>
    </div>
  )
}
