import { requireInstitutionRep } from '@/features/portal/permissions'
import { InstitutionProfileEditor } from '@/features/portal/components/institution-profile-editor'

export default async function ProfilePage({ params }: { params: Promise<{ institutionId: string }> }) {
  const { institutionId } = await params
  const { institution } = await requireInstitutionRep(institutionId)
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Institution profile</h1>
      <InstitutionProfileEditor institution={institution} />
    </div>
  )
}
