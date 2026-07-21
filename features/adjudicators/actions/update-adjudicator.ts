'use server'

import { prisma } from '@/lib/prisma'
import { toApi } from '@/lib/errors'
import { activityLog } from '@/services/activity-log'
import { requireAdjudicatorEditor } from '@/features/adjudicators/permissions/index'
import { updateAdjudicatorSchema } from '@/features/adjudicators/schemas'
import type { ApiResponse } from '@/types/api'

export async function updateAdjudicatorAction(
  formData: FormData,
): Promise<ApiResponse<{ adjudicatorId: string }>> {
  try {
    const parsed = updateAdjudicatorSchema.parse({
      adjudicatorId: formData.get('adjudicatorId'),
      displayName: formData.get('displayName') ?? undefined,
      email: formData.get('email') ?? undefined,
      phone: formData.get('phone') ?? undefined,
      experienceLevel: formData.get('experienceLevel') ?? undefined,
      availabilityNotes: formData.get('availabilityNotes') ?? undefined,
    })
    const ctx = await requireAdjudicatorEditor(parsed.adjudicatorId)
    await prisma.adjudicator.update({
      where: { id: ctx.adjudicator.id },
      data: {
        displayName: parsed.displayName ?? undefined,
        email: parsed.email ?? undefined,
        phone: parsed.phone ?? undefined,
        experienceLevel: parsed.experienceLevel ?? undefined,
        availabilityNotes: parsed.availabilityNotes ?? undefined,
      },
    })
    await activityLog.record({
      code: 'ADJUDICATOR_UPDATED', tournamentId: ctx.tournament.id, actorId: ctx.meId,
      data: { adjudicatorId: ctx.adjudicator.id, mode: ctx.mode },
    })
    return { ok: true, data: { adjudicatorId: ctx.adjudicator.id } }
  } catch (e) { return toApi(e) }
}
