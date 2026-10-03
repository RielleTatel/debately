import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireParticipantEditor } from '@/features/participants/permissions/index'
import { ParticipantEditForm } from '@/features/participants/components/participant-edit-form'

export default async function Page({
  params,
}: {
  params: Promise<{ institutionId: string; participantId: string }>
}) {
  const { institutionId, participantId } = await params
  const { participant, institution, meId } = await requireParticipantEditor(participantId)
  if (institution?.id !== institutionId) notFound()
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <Link href={`/portal/${institutionId}/participants`} className="text-sm underline">
        Back to participants
      </Link>
      <h1 className="text-xl font-semibold">Edit participant</h1>
      <ParticipantEditForm
        participant={{
          id: participant.id,
          displayName: participant.displayName,
          email: participant.email,
          phone: participant.phone,
        }}
        draftKey={`${meId}:participant:${participant.id}`}
      />
    </div>
  )
}
