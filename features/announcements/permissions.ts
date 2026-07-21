import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/errors'
import { requireTournamentDirector } from '@/features/tournaments/permissions'
export async function requireDirectorForAnnouncement(announcementId: string) {
  const a = await prisma.announcement.findUnique({ where: { id: announcementId }, select: { id: true, tournamentId: true, status: true, authorId: true } })
  if (!a) throw new AppError('NOT_FOUND', 'Announcement not found')
  const ctx = await requireTournamentDirector(a.tournamentId)
  return { announcement: a, ...ctx }
}
