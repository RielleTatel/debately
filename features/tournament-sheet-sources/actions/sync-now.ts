'use server'
import { revalidatePath } from 'next/cache'
import { AppError, toApi } from '@/lib/errors'
import { requireDirectorForSource } from '../permissions'
import { syncAndIngestOneSource } from '@/features/google-form-integration/services/sync'
import type { ApiResponse } from '@/types/api'

export async function syncNowAction(fd: FormData): Promise<ApiResponse<{ synced: number }>> {
  try {
    const sourceId = String(fd.get('sourceId') ?? '')
    if (!sourceId) throw new AppError('VALIDATION_ERROR', 'sourceId is required.')

    const { source } = await requireDirectorForSource(sourceId)

    const result = await syncAndIngestOneSource(sourceId)
    if (result.error) throw new AppError('INTERNAL_ERROR', result.error)

    revalidatePath(`/tournaments/${source.tournamentId}/settings/registration-sources`)
    revalidatePath(`/tournaments/${source.tournamentId}/institutions`)
    return { ok: true, data: { synced: result.synced } }
  } catch (e) {
    return toApi(e)
  }
}
