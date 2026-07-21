'use server'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import { requireVerifiedUser } from '@/features/auth/queries'
import { markAsReadSchema } from '@/features/announcements/schemas'
import type { ApiResponse } from '@/types/api'

export async function markAnnouncementAsReadAction(fd: FormData): Promise<ApiResponse<{ announcementId: string }>> {
  try {
    const parsed = markAsReadSchema.safeParse({ announcementId: fd.get('announcementId') })
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', parsed.error.issues[0].message)
    const me = await requireVerifiedUser()
    await prisma.announcementRead.upsert({
      where: { announcementId_profileId: { announcementId: parsed.data.announcementId, profileId: me.profile.id } },
      create: { announcementId: parsed.data.announcementId, profileId: me.profile.id },
      update: {},
    })
    return { ok: true, data: { announcementId: parsed.data.announcementId } }
  } catch (e) { return toApi(e) }
}
