import { redirect } from 'next/navigation'
import { getMyOrganizations } from '@/features/organizations/queries'
import { TournamentCreateForm } from '@/features/tournaments/components/tournament-create-form'

type Props = { searchParams: Promise<{ orgId?: string }> }

export default async function CreateTournamentPage({ searchParams }: Props) {
  const { orgId } = await searchParams
  const orgs = await getMyOrganizations()
  if (orgs.length === 0) redirect('/organization/new')

  const defaultOrgId = orgId && orgs.some((o) => o.id === orgId)
    ? orgId
    : (orgs.find((o) => o.role === 'OWNER') ?? orgs[0]).id

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create tournament</h1>
      <TournamentCreateForm
        orgOptions={orgs.map((o) => ({ id: o.id, name: o.name }))}
        defaultOrgId={defaultOrgId}
      />
    </div>
  )
}
