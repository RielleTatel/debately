import { prisma } from '@/lib/prisma'
import type { AnnouncementListItem, AnnouncementDetail } from '../types'

export async function listAnnouncementsForTournament(tournamentId: string, opts?: { status?: string }): Promise<AnnouncementListItem[]> {
  const rows = await prisma.announcement.findMany({
    where: { tournamentId, ...(opts?.status && opts.status !== 'all' ? { status: opts.status as any } : {}) },
    include: { author: { select: { displayName: true } }, _count: { select: { targets: true, reads: true } } },
    orderBy: [{ status: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
  })
  return rows.map((a) => ({ id: a.id, title: a.title, status: a.status, publishedAt: a.publishedAt, scheduledFor: a.scheduledFor, isPublic: a.isPublic, isAllInstitutions: a.isAllInstitutions, bodyHtml: a.bodyHtml, author: a.author, targetCount: a._count.targets, readCount: a._count.reads }))
}

export async function getAnnouncementById(announcementId: string): Promise<AnnouncementDetail | null> {
  return prisma.announcement.findUnique({ where: { id: announcementId }, include: { author: { select: { displayName: true, avatarUrl: true } }, targets: { include: { institution: { select: { id: true, name: true } } } } } })
}

export async function listAnnouncementsForInstitution(tournamentInstitutionId: string) {
  return prisma.announcement.findMany({ where: { status: 'PUBLISHED', OR: [{ isAllInstitutions: true }, { targets: { some: { tournamentInstitutionId } } }] }, include: { author: { select: { displayName: true } } }, orderBy: { publishedAt: 'desc' } })
}
