import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdjudicatorEditor } from '@/features/adjudicators/permissions/index'
import { AdjudicatorEditForm } from '@/features/adjudicators/components/adjudicator-edit-form'

export default async function Page({
  params,
}: {
  params: Promise<{ institutionId: string; adjudicatorId: string }>
}) {
  const { institutionId, adjudicatorId } = await params
  const { adjudicator, institution, meId } = await requireAdjudicatorEditor(adjudicatorId)
  if (institution?.id !== institutionId) notFound()
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <Link href={`/portal/${institutionId}/adjudicators`} className="text-sm underline">
        Back to adjudicators
      </Link>
      <h1 className="text-xl font-semibold">Edit adjudicator</h1>
      <AdjudicatorEditForm
        adjudicator={{
          id: adjudicator.id,
          displayName: adjudicator.displayName,
          email: adjudicator.email,
          phone: adjudicator.phone,
          experienceLevel: adjudicator.experienceLevel,
          availabilityNotes: adjudicator.availabilityNotes,
        }}
        draftKey={`${meId}:adjudicator:${adjudicator.id}`}
      />
    </div>
  )
}
