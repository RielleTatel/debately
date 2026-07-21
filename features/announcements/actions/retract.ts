'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import { requireDirectorForAnnouncement } from '@/features/announcements/permissions'
import { retractAnnouncementSchema } from '@/features/announcements/schemas'
import type { ApiResponse } from '@/types/api'

export async function retractAnnouncementAction(fd: FormData): Promise<ApiResponse<{ announcementId: string }>> {
  try {
    const parsed = retractAnnouncementSchema.safeParse({ announcementId: fd.get('announcementId'), note: fd.get('note') })
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', parsed.error.issues[0].message)
    const { announcement } = await requireDirectorForAnnouncement(parsed.data.announcementId)
    if (announcement.status !== 'PUBLISHED') throw new AppError('CONFLICT', 'Only published announcements can be retracted.')
    await prisma.announcement.update({ where: { id: announcement.id }, data: { status: 'RETRACTED', retractionNote: parsed.data.note } })
    revalidatePath(`/tournaments/${announcement.tournamentId}/announcements/${announcement.id}`)
    return { ok: true, data: { announcementId: announcement.id } }
  } catch (e) { return toApi(e) }
}
