'use server'

import { prisma } from '@/lib/prisma'
import { toApi, Errors } from '@/lib/errors'
import { activityLog } from '@/services/activity-log'
import { requireTournamentDirector } from '@/features/tournaments/permissions'
import { disableTokenSchema } from '@/features/portal/schemas'
import type { ApiResponse } from '@/types/api'

export async function disableTokenAction(
  formData: FormData,
): Promise<ApiResponse<{ institutionId: string }>> {
  try {
    const parsed = disableTokenSchema.parse({
      institutionId: formData.get('institutionId'),
      confirm: formData.get('confirm') === 'true',
    })
    const inst = await prisma.tournamentInstitution.findUnique({ where: { id: parsed.institutionId } })
    if (!inst) throw Errors.notFound('Institution not found')
    const { me } = await requireTournamentDirector(inst.tournamentId)
    await prisma.institutionPortalToken.updateMany({
      where: { tournamentInstitutionId: inst.id, active: true },
      data: { active: false, disabledAt: new Date() },
    })
    await activityLog.record({
      code: 'PORTAL_TOKEN_DISABLED',
      tournamentId: inst.tournamentId, actorId: me.profile.id,
      data: { institutionId: inst.id },
    })
    return { ok: true, data: { institutionId: inst.id } }
  } catch (e) {
    return toApi(e)
  }
}
