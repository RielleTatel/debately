'use server'

import { prisma } from '@/lib/prisma'
import { toApi } from '@/lib/errors'
import { saveMappingSchema } from '@/features/imports/schemas'
import { requireImportEditor } from '@/features/imports/permissions'
import type { ApiResponse } from '@/types/api'

export async function saveMappingAction(formData: FormData): Promise<ApiResponse<{ importId: string }>> {
  try {
    const parsed = saveMappingSchema.parse({
      importId: formData.get('importId'),
      mapping: JSON.parse(String(formData.get('mapping') ?? '{}')),
    })
    const { import: rec } = await requireImportEditor(parsed.importId)
    await prisma.csvImport.update({
      where: { id: rec.id },
      data: { mappingJson: parsed.mapping as never },
    })
    return { ok: true, data: { importId: rec.id } }
  } catch (e) {
    return toApi(e)
  }
}
