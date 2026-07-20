import { requireVerifiedUser } from '@/features/auth/queries'
import { CreateOrganizationForm } from '@/features/organizations/components/create-organization-form'

export default async function NewOrganizationPage() {
  await requireVerifiedUser()
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Create a new organization</h1>
      <CreateOrganizationForm />
    </main>
  )
}
