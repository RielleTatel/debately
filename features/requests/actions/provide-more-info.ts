'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import { requireRepForRequest } from '@/features/requests/permissions'
import { provideInfoSchema } from '@/features/requests/schemas'
import type { ApiResponse } from '@/types/api'

export async function provideMoreInfoAction(fd: FormData): Promise<ApiResponse<{ requestId: string }>> {
  try {
    const parsed = provideInfoSchema.safeParse({ requestId: fd.get('requestId'), note: fd.get('note') })
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', parsed.error.issues[0].message)

    const { request, me } = await requireRepForRequest(parsed.data.requestId)
    if (request.status !== 'MORE_INFO') throw new AppError('CONFLICT', 'Request is not awaiting more info.')

    await prisma.request.update({ where: { id: request.id }, data: { status: 'PENDING' } })
    await prisma.requestActivity.create({
      data: { requestId: request.id, actorId: me.id, kind: 'MORE_INFO_PROVIDED', note: parsed.data.note },
    })

    revalidatePath(`/tournaments/${request.tournamentId}/requests/${request.id}`)
    return { ok: true, data: { requestId: request.id } }
  } catch (e) {
    return toApi(e)
  }
}
