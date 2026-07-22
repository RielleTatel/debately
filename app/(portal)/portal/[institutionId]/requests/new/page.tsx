import { requireInstitutionRep } from '@/features/portal/permissions'
import { RequestForm } from '@/features/requests/components/request-form'

export default async function NewRequestPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const { institutionId } = await params
  await requireInstitutionRep(institutionId)

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold">New request</h1>
      <RequestForm institutionId={institutionId} />
    </div>
  )
}
