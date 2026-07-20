'use server'
import { prisma } from '@/lib/prisma'
import { requireVerifiedUser } from '@/features/auth/queries'
import { acceptInvitationSchema } from '@/features/invitations/schemas'
import { err, ok, type ActionResult } from '@/types/api'
import { isAppError } from '@/lib/errors'

export async function declineInvitationAction(fd: FormData): Promise<ActionResult<void>> {
  const parsed = acceptInvitationSchema.safeParse({ token: fd.get('token') })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')
  try {
    const me = await requireVerifiedUser()
    const invitation = await prisma.organizationInvitation.findUnique({ where: { token: parsed.data.token } })
    if (!invitation) return err('Invitation not found', 'NOT_FOUND')
    if (invitation.email.toLowerCase() !== me.user.email.toLowerCase()) {
      return err('This invitation is for a different email address', 'FORBIDDEN')
    }
    await prisma.organizationInvitation.update({ where: { id: invitation.id }, data: { revokedAt: new Date() } })
    return ok(undefined)
  } catch (e) { if (isAppError(e)) return err(e.message, e.code); throw e }
}
