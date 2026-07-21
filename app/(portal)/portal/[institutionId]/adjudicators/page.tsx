import { requireInstitutionRep } from '@/features/portal/permissions'
import { getAdjudicatorsForInstitution } from '@/features/adjudicators/queries'
import { AdjudicatorList } from '@/features/adjudicators/components/adjudicator-list'
import { AdjudicatorEditForm } from '@/features/adjudicators/components/adjudicator-edit-form'

export default async function AdjudicatorsPortalPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const { institutionId } = await params
  const { institution } = await requireInstitutionRep(institutionId)
  const adjudicators = await getAdjudicatorsForInstitution(institutionId)
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-xl font-semibold">Adjudicators</h1>
      <AdjudicatorList
        adjudicators={adjudicators.map((a) => ({ ...a, institution })) as never}
        showDirectorNotes={false}
      />
      <div className="space-y-3">
        {adjudicators.map((a) => (
          <div key={a.id} id={`edit-${a.id}`}><AdjudicatorEditForm adjudicator={a} /></div>
        ))}
      </div>
    </div>
  )
}
