'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import { requireDirectorForRequest } from '@/features/requests/permissions'
import { requestActionSchema } from '@/features/requests/schemas'
import { applyRequestSideEffect } from '@/features/requests/services/apply-side-effect'
import { notifyRequestStateChanged } from '@/features/requests/services/notify'
import { assertTournamentEditable } from '@/features/tournaments/permissions'
import type { ApiResponse } from '@/types/api'

export async function approveRequestAction(fd: FormData): Promise<ApiResponse<{ requestId: string }>> {
  try {
    const parsed = requestActionSchema.safeParse({ requestId: fd.get('requestId') })
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', parsed.error.issues[0].message)
    const { request, tournament, me } = await requireDirectorForRequest(parsed.data.requestId)
    assertTournamentEditable(tournament)
    if (request.status !== 'PENDING' && request.status !== 'MORE_INFO') throw new AppError('CONFLICT', `Request is already ${request.status.toLowerCase()}.`)
    try {
      await prisma.$transaction(async (tx) => {
        await applyRequestSideEffect(request as any, tx)
        await tx.request.update({ where: { id: request.id }, data: { status: 'APPROVED', resolvedById: me.profile.id, resolvedAt: new Date() } })
        await tx.requestActivity.create({ data: { requestId: request.id, actorId: me.profile.id, kind: 'APPROVED' } })
      })
    } catch (e) {
      await prisma.requestActivity.create({ data: { requestId: request.id, actorId: me.profile.id, kind: 'APPROVAL_ATTEMPT_FAILED', note: (e as Error).message } })
      throw e
    }
    await notifyRequestStateChanged(request.id, 'APPROVED')
    revalidatePath(`/tournaments/${request.tournamentId}/requests/${request.id}`)
    return { ok: true, data: { requestId: request.id } }
  } catch (e) { return toApi(e) }
}
