'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import { requireDirectorForSource } from '../permissions'
import { toggleActiveSchema } from '../schemas'
import type { ApiResponse } from '@/types/api'

export async function toggleActiveAction(fd: FormData): Promise<ApiResponse<void>> {
  try {
    const parsed = toggleActiveSchema.safeParse({
      sourceId: fd.get('sourceId'),
      active: fd.get('active') === 'true',
    })
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', parsed.error.issues[0].message)

    const { source } = await requireDirectorForSource(parsed.data.sourceId)

    if (parsed.data.active && !source.columnMapping) {
      throw new AppError('VALIDATION_ERROR', 'Configure column mapping before activating.', 400)
    }

    await prisma.tournamentSheetSource.update({
      where: { id: parsed.data.sourceId },
      data: { active: parsed.data.active },
    })

    revalidatePath(`/tournaments/${source.tournamentId}/settings/registration-sources`)
    return { ok: true, data: undefined }
  } catch (e) {
    return toApi(e)
  }
}
