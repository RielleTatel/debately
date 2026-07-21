'use server'

import { prisma } from '@/lib/prisma'
import { toApi, Errors } from '@/lib/errors'
import { activityLog } from '@/services/activity-log'
import { requireImportEditor } from '@/features/imports/permissions'
import { applyDiffSchema } from '@/features/imports/schemas'
import type { ApiResponse } from '@/types/api'

export async function applyDiffAction(formData: FormData): Promise<ApiResponse<{ rowIndex: number }>> {
  try {
    const parsed = applyDiffSchema.parse({
      importId: formData.get('importId'),
      rowIndex: Number(formData.get('rowIndex')),
      mode: formData.get('mode'),
      selectedFields: JSON.parse(String(formData.get('selectedFields') ?? '[]')),
    })
    const { tournamentId, meId } = await requireImportEditor(parsed.importId)
    const row = await prisma.csvImportRow.findFirst({
      where: { importId: parsed.importId, rowIndex: parsed.rowIndex },
    })
    if (!row) throw Errors.notFound('Row not found')
    const marker = `DIFF_DECISION:${parsed.mode}:${parsed.selectedFields.join(',')}`
    await prisma.csvImportRow.update({
      where: { id: row.id },
      data: {
        status: parsed.mode === 'keep-existing' ? 'SKIPPED' : 'RESUBMISSION',
        messages: [...row.messages.filter((m) => !m.startsWith('DIFF_DECISION:')), marker],
      },
    })
    await activityLog.record({
      code: 'DIFF_DECISION_RECORDED',
      tournamentId, actorId: meId,
      data: { importId: parsed.importId, rowIndex: parsed.rowIndex, mode: parsed.mode, fields: parsed.selectedFields },
    })
    return { ok: true, data: { rowIndex: parsed.rowIndex } }
  } catch (e) {
    return toApi(e)
  }
}
