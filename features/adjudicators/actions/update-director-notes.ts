'use server'

import { prisma } from '@/lib/prisma'
import { toApi, Errors } from '@/lib/errors'
import { activityLog } from '@/services/activity-log'
import { requireAdjudicatorEditor } from '@/features/adjudicators/permissions/index'
import { updateDirectorNotesSchema } from '@/features/adjudicators/schemas'
import type { ApiResponse } from '@/types/api'

export async function updateDirectorNotesAction(
  formData: FormData,
): Promise<ApiResponse<{ adjudicatorId: string }>> {
  try {
    const parsed = updateDirectorNotesSchema.parse({
      adjudicatorId: formData.get('adjudicatorId'),
      directorNotes: formData.get('directorNotes') === '' ? null : formData.get('directorNotes'),
    })
    const ctx = await requireAdjudicatorEditor(parsed.adjudicatorId, { mode: 'director' })
    if (ctx.mode !== 'director') throw Errors.forbidden()
    await prisma.adjudicator.update({
      where: { id: ctx.adjudicator.id },
      data: { directorNotes: parsed.directorNotes ?? null },
    })
    await activityLog.record({
      code: 'ADJUDICATOR_DIRECTOR_NOTES_UPDATED', tournamentId: ctx.tournament.id, actorId: ctx.meId,
      data: { adjudicatorId: ctx.adjudicator.id },
    })
    return { ok: true, data: { adjudicatorId: ctx.adjudicator.id } }
  } catch (e) { return toApi(e) }
}
