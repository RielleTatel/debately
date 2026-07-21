'use server'

import { prisma } from '@/lib/prisma'
import { toApi } from '@/lib/errors'
import { activityLog } from '@/services/activity-log'
import { requireTeamEditor } from '@/features/teams/permissions/index'
import { updateTeamSchema } from '@/features/teams/schemas'
import { recomputeTeamValidation } from '@/features/teams/services'
import type { ApiResponse } from '@/types/api'

export async function updateTeamAction(
  formData: FormData,
): Promise<ApiResponse<{ teamId: string }>> {
  try {
    const parsed = updateTeamSchema.parse({
      teamId: formData.get('teamId'),
      name: formData.get('name') ?? undefined,
      isNovice: formData.get('isNovice') === 'true'
        ? true
        : formData.get('isNovice') === 'false'
          ? false
          : undefined,
    })
    const ctx = await requireTeamEditor(parsed.teamId)
    await prisma.team.update({
      where: { id: ctx.team.id },
      data: { name: parsed.name ?? undefined, isNovice: parsed.isNovice ?? undefined },
    })
    await recomputeTeamValidation(ctx.team.id)
    await activityLog.record({
      code: 'TEAM_UPDATED', tournamentId: ctx.tournament.id, actorId: ctx.meId,
      data: { teamId: ctx.team.id, mode: ctx.mode },
    })
    return { ok: true, data: { teamId: ctx.team.id } }
  } catch (e) { return toApi(e) }
}
