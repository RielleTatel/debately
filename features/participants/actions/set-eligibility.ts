'use server'

import { prisma } from '@/lib/prisma'
import { toApi, Errors } from '@/lib/errors'
import { activityLog } from '@/services/activity-log'
import { requireParticipantEditor } from '@/features/participants/permissions/index'
import { setEligibilitySchema } from '@/features/participants/schemas'
import { recomputeTeamValidation } from '@/features/teams/services'
import type { ApiResponse } from '@/types/api'

export async function setEligibilityAction(
  formData: FormData,
): Promise<ApiResponse<{ participantId: string }>> {
  try {
    const parsed = setEligibilitySchema.parse({
      participantId: formData.get('participantId'),
      eligibility: formData.get('eligibility'),
      reason: formData.get('reason') ?? undefined,
    })
    const ctx = await requireParticipantEditor(parsed.participantId, { mode: 'director' })
    if (ctx.mode !== 'director') throw Errors.forbidden()
    const updated = await prisma.participant.update({
      where: { id: ctx.participant.id },
      data: {
        eligibility: parsed.eligibility,
        ineligibilityReason: parsed.eligibility === 'INELIGIBLE' ? parsed.reason : null,
      },
    })
    if (updated.teamId) await recomputeTeamValidation(updated.teamId)
    await activityLog.record({
      code: 'PARTICIPANT_ELIGIBILITY_SET', tournamentId: ctx.tournament.id, actorId: ctx.meId,
      data: { participantId: updated.id, eligibility: parsed.eligibility, reason: parsed.reason ?? null },
    })
    return { ok: true, data: { participantId: updated.id } }
  } catch (e) { return toApi(e) }
}
