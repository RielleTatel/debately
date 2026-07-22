'use server'

import { prisma } from '@/lib/prisma'
import { toApi, Errors } from '@/lib/errors'
import { activityLog } from '@/services/activity-log'
import { logActivity } from '@/features/activity/services'
import { requireVerifiedUser } from '@/features/auth/queries'
import { claimTokenSchema } from '@/features/portal/schemas'
import type { ApiResponse } from '@/types/api'

export async function claimPortalAction(
  formData: FormData,
): Promise<ApiResponse<{ institutionId: string }>> {
  try {
    const parsed = claimTokenSchema.parse({ token: formData.get('token') })
    const me = await requireVerifiedUser()
    const token = await prisma.institutionPortalToken.findUnique({ where: { token: parsed.token } })
    if (!token || !token.active) throw Errors.notFound('This portal link is no longer valid')
    const existing = await prisma.institutionClaim.findUnique({
      where: { tournamentInstitutionId: token.tournamentInstitutionId },
    })
    if (existing) {
      if (existing.profileId !== me.profile.id) {
        throw Errors.conflict('This institution has already been claimed')
      }
      return { ok: true, data: { institutionId: token.tournamentInstitutionId } }
    }
    await prisma.institutionClaim.create({
      data: { tournamentInstitutionId: token.tournamentInstitutionId, profileId: me.profile.id },
    })
    const inst = await prisma.tournamentInstitution.findUnique({
      where: { id: token.tournamentInstitutionId },
      select: { tournamentId: true },
    })
    if (inst) {
      await activityLog.record({
        code: 'INSTITUTION_PORTAL_CLAIMED',
        tournamentId: inst.tournamentId,
        actorId: me.profile.id,
        data: { institutionId: token.tournamentInstitutionId },
      })
      await logActivity({ action: 'PORTAL_CLAIMED', resourceType: 'institution_portal', resourceId: token.tournamentInstitutionId, description: 'Portal claimed', tournamentId: inst.tournamentId, actorId: me.profile.id, actorRoleAtTime: 'INSTITUTION_REP' })
    }
    return { ok: true, data: { institutionId: token.tournamentInstitutionId } }
  } catch (e) {
    return toApi(e)
  }
}
