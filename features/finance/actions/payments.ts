'use server'
import { invalidateFinancialViews } from '@/features/tournaments/services/invalidate-views'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import { requireTournamentDirector } from '@/features/tournaments/permissions'
import { logActivity } from '@/features/activity/services'
import type { ApiResponse } from '@/types/api'

async function requireDirectorForPayment(paymentId: string) {
  const payment = await prisma.tournamentPayment.findUnique({
    where: { id: paymentId },
    include: { institution: true },
  })
  if (!payment) throw new AppError('NOT_FOUND', 'Payment not found.')
  const auth = await requireTournamentDirector(payment.tournamentId)
  return { payment, ...auth }
}

export async function updatePaymentAction(
  fd: FormData,
): Promise<ApiResponse<{ paymentId: string }>> {
  try {
    const paymentId = fd.get('paymentId') as string
    if (!paymentId) throw new AppError('VALIDATION_ERROR', 'paymentId required.')
    const { payment, me } = await requireDirectorForPayment(paymentId)

    const rawAmount = fd.get('amountMinor')
    const amountMinor = rawAmount ? parseInt(rawAmount as string, 10) : undefined
    const notes = (fd.get('notes') as string | null) ?? undefined
    const status = (fd.get('status') as string | null) ?? undefined
    const receivedAtRaw = fd.get('receivedAt') as string | null
    const receivedAt = receivedAtRaw ? new Date(receivedAtRaw) : undefined

    const updated = await prisma.tournamentPayment.update({
      where: { id: paymentId },
      data: {
        ...(amountMinor !== undefined && { amountMinor }),
        ...(notes !== undefined && { notes }),
        ...(status !== undefined && { status: status as never }),
        ...(receivedAt !== undefined && { receivedAt }),
      },
    })

    await logActivity({
      action: 'PAYMENT_UPDATED',
      resourceType: 'tournament_payment',
      resourceId: payment.id,
      description: `Payment updated for ${payment.institution.name}`,
      tournamentId: payment.tournamentId,
      actorId: me.profile.id,
      actorRoleAtTime: 'DIRECTOR',
      before: { amountMinor: payment.amountMinor, notes: payment.notes, status: payment.status },
      after: { amountMinor: updated.amountMinor, notes: updated.notes, status: updated.status },
    })

    revalidatePath(`/tournaments/${payment.tournamentId}/finance`)
    revalidatePath(
      `/tournaments/${payment.tournamentId}/finance/${payment.tournamentInstitutionId}`,
    )
    invalidateFinancialViews(payment.tournamentId, [payment.tournamentInstitutionId])
    return { ok: true, data: { paymentId: payment.id } }
  } catch (e) {
    return toApi(e)
  }
}

export async function voidPaymentAction(fd: FormData): Promise<ApiResponse<{ paymentId: string }>> {
  try {
    const paymentId = fd.get('paymentId') as string
    if (!paymentId) throw new AppError('VALIDATION_ERROR', 'paymentId required.')
    const { payment, me } = await requireDirectorForPayment(paymentId)

    if (payment.status === 'VOIDED') throw new AppError('CONFLICT', 'Payment already voided.')

    await prisma.tournamentPayment.update({
      where: { id: paymentId },
      data: { status: 'VOIDED' },
    })

    await logActivity({
      action: 'PAYMENT_VOIDED',
      resourceType: 'tournament_payment',
      resourceId: payment.id,
      description: `Payment voided for ${payment.institution.name}`,
      tournamentId: payment.tournamentId,
      actorId: me.profile.id,
      actorRoleAtTime: 'DIRECTOR',
    })

    revalidatePath(`/tournaments/${payment.tournamentId}/finance`)
    revalidatePath(
      `/tournaments/${payment.tournamentId}/finance/${payment.tournamentInstitutionId}`,
    )
    invalidateFinancialViews(payment.tournamentId, [payment.tournamentInstitutionId])
    return { ok: true, data: { paymentId: payment.id } }
  } catch (e) {
    return toApi(e)
  }
}
