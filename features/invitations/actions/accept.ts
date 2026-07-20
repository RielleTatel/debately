'use server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireVerifiedUser } from '@/features/auth/queries'
import { acceptInvitationSchema } from '@/features/invitations/schemas'
import { err, type ActionResult } from '@/types/api'
import { isAppError } from '@/lib/errors'

export async function acceptInvitationAction(fd: FormData): Promise<ActionResult<{ slug: string }>> {
  const parsed = acceptInvitationSchema.safeParse({ token: fd.get('token') })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')
  try {
    const me = await requireVerifiedUser()
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token: parsed.data.token }, include: { organization: true },
    })
    if (!invitation) return err('Invitation not found', 'NOT_FOUND')
    if (invitation.revokedAt) return err('Invitation was revoked', 'CONFLICT')
    if (invitation.acceptedAt) return err('Invitation was already accepted', 'CONFLICT')
    if (invitation.expiresAt.getTime() < Date.now()) return err('Invitation has expired', 'CONFLICT')
    if (invitation.email.toLowerCase() !== me.user.email.toLowerCase()) {
      return err('This invitation is for a different email address', 'FORBIDDEN')
    }
    await prisma.$transaction(async (tx) => {
      const existing = await tx.organizationMember.findUnique({
        where: { orgId_profileId: { orgId: invitation.orgId, profileId: me.profile.id } },
      })
      if (!existing) {
        await tx.organizationMember.create({
          data: { orgId: invitation.orgId, profileId: me.profile.id, role: invitation.role },
        })
      }
      await tx.organizationInvitation.update({ where: { id: invitation.id }, data: { acceptedAt: new Date() } })
    })
    redirect(`/organization/${invitation.organization.slug}`)
  } catch (e) { if (isAppError(e)) return err(e.message, e.code); throw e }
}
