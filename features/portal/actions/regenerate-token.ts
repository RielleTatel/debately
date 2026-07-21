'use server'

import { randomBytes } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { toApi, Errors } from '@/lib/errors'
import { activityLog } from '@/services/activity-log'
import { requireTournamentDirector } from '@/features/tournaments/permissions'
import { regenerateTokenSchema } from '@/features/portal/schemas'
import type { ApiResponse } from '@/types/api'

export async function regenerateTokenAction(
  formData: FormData,
): Promise<ApiResponse<{ token: string }>> {
  try {
    const parsed = regenerateTokenSchema.parse({ institutionId: formData.get('institutionId') })
    const inst = await prisma.tournamentInstitution.findUnique({ where: { id: parsed.institutionId } })
    if (!inst) throw Errors.notFound('Institution not found')
    const { me } = await requireTournamentDirector(inst.tournamentId)
    const created = await prisma.$transaction(async (tx) => {
      await tx.institutionPortalToken.updateMany({
        where: { tournamentInstitutionId: inst.id, active: true },
        data: { active: false, regeneratedAt: new Date() },
      })
      return tx.institutionPortalToken.create({
        data: {
          tournamentInstitutionId: inst.id,
          token: randomBytes(32).toString('base64url'),
          active: true,
        },
      })
    })
    await activityLog.record({
      code: 'PORTAL_TOKEN_REGENERATED',
      tournamentId: inst.tournamentId, actorId: me.profile.id,
      data: { institutionId: inst.id },
    })
    return { ok: true, data: { token: created.token } }
  } catch (e) {
    return toApi(e)
  }
}
