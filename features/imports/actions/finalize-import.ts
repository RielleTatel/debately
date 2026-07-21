'use server'

import { toApi, Errors } from '@/lib/errors'
import { activityLog } from '@/services/activity-log'
import { requireImportEditor } from '@/features/imports/permissions'
import { finalizeImportSchema } from '@/features/imports/schemas'
import { finalizeImport, type FinalizeResult } from '@/features/imports/services/finalize'
import type { ApiResponse } from '@/types/api'

export async function finalizeImportAction(
  formData: FormData,
): Promise<ApiResponse<FinalizeResult>> {
  try {
    const parsed = finalizeImportSchema.parse({ importId: formData.get('importId') })
    const { import: rec, tournamentId, meId } = await requireImportEditor(parsed.importId)
    if (rec.status !== 'PROCESSED') throw Errors.conflict('Import is not in PROCESSED state')
    const result = await finalizeImport(parsed.importId)
    await activityLog.record({
      code: 'IMPORT_FINALIZED',
      tournamentId, actorId: meId,
      data: { importId: parsed.importId, ...result },
    })
    return { ok: true, data: result }
  } catch (e) {
    return toApi(e)
  }
}
