'use server'

import { requireUser } from '@/features/auth/queries'
import { avatarStorage } from '@/services/storage/avatars'
import { prisma } from '@/lib/prisma'
import { err, ok, type ActionResult } from '@/types/api'
import { isAppError } from '@/lib/errors'

export async function uploadAvatarAction(fd: FormData): Promise<ActionResult<{ url: string }>> {
  const file = fd.get('file')
  if (!(file instanceof File)) return err('No file provided', 'VALIDATION_ERROR')

  const v = avatarStorage.validate(file)
  if (!v.ok) return err(v.message, 'VALIDATION_ERROR')

  try {
    const me = await requireUser()
    const url = await avatarStorage.upload(me.user.id, file)
    await prisma.profile.update({ where: { userId: me.user.id }, data: { avatarUrl: url } })
    return ok({ url })
  } catch (e) {
    if (isAppError(e)) return err(e.message, e.code)
    throw e
  }
}
