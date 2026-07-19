'use server'

import { requireUser } from '@/features/auth/queries'
import { updateProfileSchema } from '@/features/auth/schemas'
import { prisma } from '@/lib/prisma'
import { err, ok, type ActionResult } from '@/types/api'

export async function updateProfileAction(fd: FormData): Promise<ActionResult> {
  const parsed = updateProfileSchema.safeParse({ displayName: fd.get('displayName') })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')
  const me = await requireUser()
  await prisma.profile.update({
    where: { userId: me.user.id },
    data: { displayName: parsed.data.displayName },
  })
  return ok(undefined)
}
