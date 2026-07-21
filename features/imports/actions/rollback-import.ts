'use server'

import { prisma } from '@/lib/prisma'
import { toApi, Errors } from '@/lib/errors'
import { activityLog } from '@/services/activity-log'
import { requireImportEditor } from '@/features/imports/permissions'
import { rollbackImportSchema } from '@/features/imports/schemas'
import type { ApiResponse } from '@/types/api'

export async function rollbackImportAction(
  formData: FormData,
): Promise<ApiResponse<{ importId: string }>> {
  try {
    const parsed = rollbackImportSchema.parse({
      importId: formData.get('importId'),
      confirm: formData.get('confirm') === 'true',
    })
    const { import: rec, tournamentId, meId } = await requireImportEditor(parsed.importId)
    if (rec.status !== 'FINALIZED' && rec.status !== 'PROCESSED') {
      throw Errors.conflict('Only PROCESSED or FINALIZED imports can be rolled back')
    }
    await prisma.csvImport.update({
      where: { id: parsed.importId },
      data: { status: 'ROLLED_BACK' },
    })
    await activityLog.record({
      code: 'IMPORT_ROLLED_BACK',
      tournamentId, actorId: meId,
      data: { importId: parsed.importId, previousStatus: rec.status },
    })
    return { ok: true, data: { importId: parsed.importId } }
  } catch (e) {
    return toApi(e)
  }
}
