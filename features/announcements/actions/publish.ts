'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import { requireDirectorForAnnouncement } from '@/features/announcements/permissions'
import { assertTournamentEditable } from '@/features/tournaments/permissions'
import type { ApiResponse } from '@/types/api'

export async function publishAnnouncementAction(fd: FormData): Promise<ApiResponse<{ announcementId: string }>> {
  try {
    const announcementId = String(fd.get('announcementId') ?? '')
    if (!announcementId) throw new AppError('VALIDATION_ERROR', 'announcementId required')
    const { announcement, tournament } = await requireDirectorForAnnouncement(announcementId)
    assertTournamentEditable(tournament)
    if (announcement.status !== 'DRAFT' && announcement.status !== 'SCHEDULED') throw new AppError('CONFLICT', 'Not in a publishable state.')
    await prisma.announcement.update({ where: { id: announcement.id }, data: { status: 'PUBLISHED', publishedAt: new Date(), scheduledFor: null } })
    revalidatePath(`/tournaments/${announcement.tournamentId}/announcements`)
    return { ok: true, data: { announcementId: announcement.id } }
  } catch (e) { return toApi(e) }
}
