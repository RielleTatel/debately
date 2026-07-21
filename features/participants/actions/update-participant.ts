'use server'

import { prisma } from '@/lib/prisma'
import { toApi } from '@/lib/errors'
import { activityLog } from '@/services/activity-log'
import { requireParticipantEditor } from '@/features/participants/permissions/index'
import { updateParticipantSchema } from '@/features/participants/schemas'
import { recomputeTeamValidation } from '@/features/teams/services'
import type { ApiResponse } from '@/types/api'

export async function updateParticipantAction(
  formData: FormData,
): Promise<ApiResponse<{ participantId: string }>> {
  try {
    const parsed = updateParticipantSchema.parse({
      participantId: formData.get('participantId'),
      displayName: formData.get('displayName') ?? undefined,
      email: formData.get('email') ?? undefined,
      phone: formData.get('phone') ?? undefined,
    })
    const ctx = await requireParticipantEditor(parsed.participantId)
    const updated = await prisma.participant.update({
      where: { id: ctx.participant.id },
      data: {
        displayName: parsed.displayName ?? undefined,
        email: parsed.email ?? undefined,
        phone: parsed.phone ?? undefined,
      },
    })
    if (updated.teamId) await recomputeTeamValidation(updated.teamId)
    await activityLog.record({
      code: 'PARTICIPANT_UPDATED', tournamentId: ctx.tournament.id, actorId: ctx.meId,
      data: { participantId: updated.id, mode: ctx.mode },
    })
    return { ok: true, data: { participantId: updated.id } }
  } catch (e) { return toApi(e) }
}
