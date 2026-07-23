'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import { requireDirectorForSource } from '../permissions'
import { updateMappingSchema } from '../schemas'
import type { ApiResponse } from '@/types/api'

export async function updateMappingAction(fd: FormData): Promise<ApiResponse<void>> {
  try {
    const mappingRaw = fd.get('columnMapping')
    let mappingParsed: Record<string, string>
    try {
      mappingParsed = JSON.parse(String(mappingRaw ?? '{}'))
    } catch {
      throw new AppError('VALIDATION_ERROR', 'columnMapping must be valid JSON.')
    }

    const parsed = updateMappingSchema.safeParse({
      sourceId: fd.get('sourceId'),
      columnMapping: mappingParsed,
    })
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', parsed.error.issues[0].message)

    const { source } = await requireDirectorForSource(parsed.data.sourceId)

    await prisma.tournamentSheetSource.update({
      where: { id: parsed.data.sourceId },
      data: { columnMapping: parsed.data.columnMapping },
    })

    revalidatePath(`/tournaments/${source.tournamentId}/settings/registration-sources`)
    return { ok: true, data: undefined }
  } catch (e) {
    return toApi(e)
  }
}
