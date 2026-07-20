'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireOrgOwner } from '@/features/organizations/permissions'
import { revokeInvitationSchema } from '@/features/invitations/schemas'
import { err, ok, type ActionResult } from '@/types/api'
import { isAppError } from '@/lib/errors'

export async function revokeInvitationAction(fd: FormData): Promise<ActionResult<void>> {
  const parsed = revokeInvitationSchema.safeParse({ invitationId: fd.get('invitationId') })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')
  try {
    const invitation = await prisma.organizationInvitation.findUnique({ where: { id: parsed.data.invitationId } })
    if (!invitation) return err('Invitation not found', 'NOT_FOUND')
    if (invitation.acceptedAt) return err('Invitation was already accepted', 'CONFLICT')
    if (invitation.revokedAt) return ok(undefined)
    const { org } = await requireOrgOwner(invitation.orgId)
    await prisma.organizationInvitation.update({ where: { id: invitation.id }, data: { revokedAt: new Date() } })
    revalidatePath(`/organization/${org.slug}/members`)
    return ok(undefined)
  } catch (e) { if (isAppError(e)) return err(e.message, e.code); throw e }
}
