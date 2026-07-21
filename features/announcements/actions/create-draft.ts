'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import { requireTournamentDirector, assertTournamentEditable } from '@/features/tournaments/permissions'
import { createAnnouncementSchema } from '@/features/announcements/schemas'
import { sanitizeAnnouncementHtml } from '@/services/sanitize'
import { announcementAttachmentsStorage } from '@/services/storage/announcement-attachments'
import type { ApiResponse } from '@/types/api'

export async function createDraftAnnouncementAction(fd: FormData): Promise<ApiResponse<{ announcementId: string }>> {
  try {
    const institutionIds = fd.getAll('institutionIds').map(String).filter(Boolean)
    const parsed = createAnnouncementSchema.safeParse({
      tournamentId: fd.get('tournamentId'), title: fd.get('title'), bodyHtml: fd.get('bodyHtml'),
      isAllInstitutions: fd.get('isAllInstitutions') === 'true', institutionIds,
      scheduledFor: fd.get('scheduledFor') ? String(fd.get('scheduledFor')) : null,
      isPublic: fd.get('isPublic') === 'true',
    })
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', parsed.error.issues[0].message)
    const { tournament, me } = await requireTournamentDirector(parsed.data.tournamentId)
    assertTournamentEditable(tournament)
    const cleanBody = sanitizeAnnouncementHtml(parsed.data.bodyHtml)
    const file = fd.get('file')
    const announcement = await prisma.announcement.create({
      data: {
        tournamentId: parsed.data.tournamentId, authorId: me.profile.id,
        title: parsed.data.title, bodyHtml: cleanBody,
        isAllInstitutions: parsed.data.isAllInstitutions, isPublic: parsed.data.isPublic,
        scheduledFor: parsed.data.scheduledFor ?? null, status: 'DRAFT',
        targets: parsed.data.isAllInstitutions ? undefined : { create: parsed.data.institutionIds.map((id) => ({ tournamentInstitutionId: id })) },
      },
    })
    if (file instanceof File && file.size > 0) {
      const path = await announcementAttachmentsStorage.upload(announcement.id, file)
      await prisma.announcement.update({ where: { id: announcement.id }, data: { attachmentPath: path } })
    }
    revalidatePath(`/tournaments/${parsed.data.tournamentId}/announcements`)
    return { ok: true, data: { announcementId: announcement.id } }
  } catch (e) { return toApi(e) }
}
