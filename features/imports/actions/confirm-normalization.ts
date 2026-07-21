'use server'

import { toApi } from '@/lib/errors'
import { activityLog } from '@/services/activity-log'
import { requireImportEditor } from '@/features/imports/permissions'
import { confirmNormalizationSchema } from '@/features/imports/schemas'
import { applyConfirmedAlias } from '@/features/imports/services/normalize-institution'
import type { ApiResponse } from '@/types/api'

export async function confirmNormalizationAction(
  formData: FormData,
): Promise<ApiResponse<{ importId: string }>> {
  try {
    const parsed = confirmNormalizationSchema.parse({
      importId: formData.get('importId'),
      rawName: formData.get('rawName'),
      decision: formData.get('decision'),
      targetInstitutionId: formData.get('targetInstitutionId') ?? undefined,
    })
    const { tournamentId, meId } = await requireImportEditor(parsed.importId)
    if (parsed.decision === 'confirm' && parsed.targetInstitutionId) {
      await applyConfirmedAlias(tournamentId, parsed.rawName, parsed.targetInstitutionId)
    }
    await activityLog.record({
      code: parsed.decision === 'confirm' ? 'NORMALIZATION_CONFIRMED' : 'NORMALIZATION_REJECTED',
      tournamentId, actorId: meId,
      data: { importId: parsed.importId, rawName: parsed.rawName, targetInstitutionId: parsed.targetInstitutionId ?? null },
    })
    return { ok: true, data: { importId: parsed.importId } }
  } catch (e) {
    return toApi(e)
  }
}
