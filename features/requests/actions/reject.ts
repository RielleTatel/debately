'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import { requireDirectorForRequest } from '@/features/requests/permissions'
import { rejectRequestSchema } from '@/features/requests/schemas'
import { assertTournamentEditable } from '@/features/tournaments/permissions'
import type { ApiResponse } from '@/types/api'

export async function rejectRequestAction(fd: FormData): Promise<ApiResponse<{ requestId: string }>> {
  try {
    const parsed = rejectRequestSchema.safeParse({ requestId: fd.get('requestId'), reason: fd.get('reason') })
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', parsed.error.issues[0].message)
    const { request, tournament, me } = await requireDirectorForRequest(parsed.data.requestId)
    assertTournamentEditable(tournament)
    if (request.status !== 'PENDING' && request.status !== 'MORE_INFO') throw new AppError('CONFLICT', `Request is already ${request.status.toLowerCase()}.`)
    await prisma.request.update({ where: { id: request.id }, data: { status: 'REJECTED', resolvedById: me.profile.id, resolvedAt: new Date() } })
    await prisma.requestActivity.create({ data: { requestId: request.id, actorId: me.profile.id, kind: 'REJECTED', note: parsed.data.reason } })
    revalidatePath(`/tournaments/${request.tournamentId}/requests/${request.id}`)
    return { ok: true, data: { requestId: request.id } }
  } catch (e) { return toApi(e) }
}
