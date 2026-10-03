import Link from 'next/link'
import { requireTournamentDirector } from '@/features/tournaments/permissions'
import { prisma } from '@/lib/prisma'
import { AnnouncementForm } from '@/features/announcements/components/announcement-form'

export default async function NewAnnouncementPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>
}) {
  const { tournamentId } = await params
  await requireTournamentDirector(tournamentId)
  const institutions = await prisma.tournamentInstitution.findMany({
    where: { tournamentId },
    select: { id: true, name: true },
    orderBy: [{ name: 'asc' }, { id: 'asc' }],
  })
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">New announcement</h1>
      <AnnouncementForm tournamentId={tournamentId} institutions={institutions} />
      <Link href={`/tournaments/${tournamentId}/announcements`} className="text-sm underline">
        Cancel
      </Link>
    </div>
  )
}
