'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import { requireDirectorForAnnouncement } from '@/features/announcements/permissions'
import { assertTournamentEditable } from '@/features/tournaments/permissions'
import { updateAnnouncementSchema } from '@/features/announcements/schemas'
import { sanitizeAnnouncementHtml } from '@/services/sanitize'
import type { ApiResponse } from '@/types/api'

export async function updateAnnouncementAction(fd: FormData): Promise<ApiResponse<{ announcementId: string }>> {
  try {
    const parsed = updateAnnouncementSchema.safeParse({
      announcementId: fd.get('announcementId'),
      title: fd.get('title'),
      bodyHtml: fd.get('bodyHtml'),
      isPublic: fd.get('isPublic') === 'true',
    })
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', parsed.error.issues[0].message)

    const { announcement, tournament } = await requireDirectorForAnnouncement(parsed.data.announcementId)
    assertTournamentEditable(tournament)

    const wasPublished = announcement.status === 'PUBLISHED'
    await prisma.announcement.update({
      where: { id: announcement.id },
      data: {
        title: parsed.data.title,
        bodyHtml: sanitizeAnnouncementHtml(parsed.data.bodyHtml),
        isPublic: parsed.data.isPublic,
        editedAt: wasPublished ? new Date() : undefined,
      },
    })

    revalidatePath(`/tournaments/${announcement.tournamentId}/announcements/${announcement.id}`)
    return { ok: true, data: { announcementId: announcement.id } }
  } catch (e) {
    return toApi(e)
  }
}
