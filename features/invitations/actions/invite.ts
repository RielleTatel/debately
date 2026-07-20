'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireOrgOwner } from '@/features/organizations/permissions'
import { inviteMemberSchema } from '@/features/invitations/schemas'
import { generateInviteToken } from '@/features/invitations/services/token'
import { emailService } from '@/services/email'
import { env } from '@/lib/env'
import { logger } from '@/services/logger'
import { err, ok, type ActionResult } from '@/types/api'
import { isAppError } from '@/lib/errors'

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000

export async function inviteMemberAction(fd: FormData): Promise<ActionResult<void>> {
  const orgId = String(fd.get('orgId') ?? '')
  const parsed = inviteMemberSchema.safeParse({ email: fd.get('email'), role: fd.get('role') })
  if (!orgId) return err('Missing organization id', 'VALIDATION_ERROR')
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')
  try {
    const { me, org } = await requireOrgOwner(orgId)
    const email = parsed.data.email.toLowerCase()
    const pending = await prisma.organizationInvitation.findFirst({
      where: { orgId: org.id, email, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
    })
    if (pending) return err('An invitation for this email is already pending.', 'CONFLICT')
    const token = generateInviteToken()
    await prisma.organizationInvitation.create({
      data: { orgId: org.id, email, role: parsed.data.role, token, expiresAt: new Date(Date.now() + INVITE_TTL_MS) },
    })
    try {
      await emailService.sendOrganizationInvite({
        to: email, inviterName: me.profile.displayName, orgName: org.name,
        acceptUrl: `${env.NEXT_PUBLIC_APP_URL}/invite/${token}`,
      })
    } catch (e) { logger.error('Failed to send invitation email', { email, orgId: org.id, error: e }) }
    revalidatePath(`/organization/${org.slug}/members`)
    return ok(undefined)
  } catch (e) { if (isAppError(e)) return err(e.message, e.code); throw e }
}
