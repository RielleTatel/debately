import { prisma } from '@/lib/prisma'
export async function getUnreadAnnouncementCount(profileId: string, tournamentInstitutionId: string): Promise<number> {
  const [total, read] = await Promise.all([
    prisma.announcement.count({ where: { status: 'PUBLISHED', OR: [{ isAllInstitutions: true, tournament: { institutions: { some: { id: tournamentInstitutionId } } } }, { targets: { some: { tournamentInstitutionId } } }] } }),
    prisma.announcementRead.count({ where: { profileId, announcement: { OR: [{ isAllInstitutions: true, tournament: { institutions: { some: { id: tournamentInstitutionId } } } }, { targets: { some: { tournamentInstitutionId } } }] } } }),
  ])
  return Math.max(0, total - read)
}
