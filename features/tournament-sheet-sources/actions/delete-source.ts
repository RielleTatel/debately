'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import { requireDirectorForSource } from '../permissions'
import { deleteSourceSchema } from '../schemas'
import type { ApiResponse } from '@/types/api'

export async function deleteSourceAction(fd: FormData): Promise<ApiResponse<void>> {
  try {
    const parsed = deleteSourceSchema.safeParse({ sourceId: fd.get('sourceId') })
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', parsed.error.issues[0].message)

    const { source } = await requireDirectorForSource(parsed.data.sourceId)

    await prisma.tournamentSheetSource.delete({ where: { id: parsed.data.sourceId } })

    revalidatePath(`/tournaments/${source.tournamentId}/settings/registration-sources`)
    return { ok: true, data: undefined }
  } catch (e) {
    return toApi(e)
  }
}
