import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireTeamEditor } from '@/features/teams/permissions/index'
import { TeamEditForm } from '@/features/teams/components/team-edit-form'

export default async function Page({
  params,
}: {
  params: Promise<{ institutionId: string; teamId: string }>
}) {
  const { institutionId, teamId } = await params
  const { team, institution, meId } = await requireTeamEditor(teamId)
  if (institution?.id !== institutionId) notFound()
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <Link href={`/portal/${institutionId}/teams`} className="text-sm underline">
        Back to teams
      </Link>
      <h1 className="text-xl font-semibold">Edit team</h1>
      <TeamEditForm
        team={{ id: team.id, name: team.name, isNovice: team.isNovice }}
        draftKey={`${meId}:team:${team.id}`}
      />
    </div>
  )
}
