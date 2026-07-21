'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import { requireInstitutionRep } from '@/features/portal/permissions'
import { submitRequestSchema } from '@/features/requests/schemas'
import { REQUEST_REGISTRY } from '@/features/requests/services/registry'
import { isBeforeRegistrationDeadline } from '@/features/tournaments/permissions'
import { notifyRequestSubmitted } from '@/features/requests/services/notify'
import type { ApiResponse } from '@/types/api'

export async function submitRequestAction(fd: FormData): Promise<ApiResponse<{ requestId: string; sequenceNumber: number }>> {
  try {
    const parsed = submitRequestSchema.safeParse({ tournamentInstitutionId: fd.get('tournamentInstitutionId'), type: fd.get('type'), description: fd.get('description'), payloadRaw: fd.get('payload') ?? '{}' })
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', parsed.error.issues[0].message)
    const { institution, tournament, me } = await requireInstitutionRep(parsed.data.tournamentInstitutionId)
    const registry = REQUEST_REGISTRY[parsed.data.type]
    if (!registry.postDeadlineAllowed) {
      const ok = await isBeforeRegistrationDeadline(tournament.id)
      if (!ok) throw new AppError('CONFLICT', 'Registration deadline has passed.')
    }
    let payload: unknown = {}
    try { payload = JSON.parse(parsed.data.payloadRaw) } catch { throw new AppError('VALIDATION_ERROR', 'Invalid payload JSON') }
    const payloadParsed = registry.payloadSchema.safeParse(payload)
    if (!payloadParsed.success) throw new AppError('VALIDATION_ERROR', payloadParsed.error.issues[0].message)
    const result = await prisma.$transaction(async (tx) => {
      const nextSeq = await tx.request.count({ where: { tournamentId: tournament.id } }) + 1
      const request = await tx.request.create({ data: { tournamentId: tournament.id, tournamentInstitutionId: institution.id, submitterId: me.id, sequenceNumber: nextSeq, type: parsed.data.type, description: parsed.data.description, payload: payloadParsed.data as any, status: 'PENDING' } })
      await tx.requestActivity.create({ data: { requestId: request.id, actorId: me.id, kind: 'SUBMITTED', note: null } })
      return request
    })
    await notifyRequestSubmitted(result.id)
    revalidatePath(`/tournaments/${tournament.id}/requests`)
    return { ok: true, data: { requestId: result.id, sequenceNumber: result.sequenceNumber } }
  } catch (e) { return toApi(e) }
}
