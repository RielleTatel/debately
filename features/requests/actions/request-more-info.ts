'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import { requireDirectorForRequest } from '@/features/requests/permissions'
import { moreInfoSchema } from '@/features/requests/schemas'
import { assertTournamentEditable } from '@/features/tournaments/permissions'
import type { ApiResponse } from '@/types/api'

export async function requestMoreInfoAction(fd: FormData): Promise<ApiResponse<{ requestId: string }>> {
  try {
    const parsed = moreInfoSchema.safeParse({ requestId: fd.get('requestId'), note: fd.get('note') })
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', parsed.error.issues[0].message)

    const { request, tournament, me } = await requireDirectorForRequest(parsed.data.requestId)
    assertTournamentEditable(tournament)

    if (request.status !== 'PENDING') throw new AppError('CONFLICT', `Request is ${request.status.toLowerCase()}.`)

    await prisma.request.update({ where: { id: request.id }, data: { status: 'MORE_INFO' } })
    await prisma.requestActivity.create({
      data: { requestId: request.id, actorId: me.profile.id, kind: 'MORE_INFO_REQUESTED', note: parsed.data.note },
    })

    revalidatePath(`/tournaments/${request.tournamentId}/requests/${request.id}`)
    return { ok: true, data: { requestId: request.id } }
  } catch (e) {
    return toApi(e)
  }
}
