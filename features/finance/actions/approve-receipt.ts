'use server'
import { invalidateFinancialViews } from '@/features/tournaments/services/invalidate-views'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import {
  requireDirectorForReceipt,
  assertPaymentActionsAllowed,
} from '@/features/finance/permissions'
import { approveReceiptSchema } from '@/features/finance/schemas'
import { notifyReceiptApproved } from '@/features/finance/services/notify-finance'
import { logActivity } from '@/features/activity/services'
import type { ApiResponse } from '@/types/api'

export async function approveReceiptAction(
  fd: FormData,
): Promise<ApiResponse<{ receiptId: string }>> {
  try {
    const parsed = approveReceiptSchema.safeParse({ receiptId: fd.get('receiptId') })
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', parsed.error.issues[0].message)
    const { receipt, tournament, me } = await requireDirectorForReceipt(parsed.data.receiptId)
    assertPaymentActionsAllowed(tournament)
    if (receipt.status !== 'SUBMITTED')
      throw new AppError('CONFLICT', `Receipt already ${receipt.status.toLowerCase()}.`)
    await prisma.paymentReceipt.update({
      where: { id: receipt.id },
      data: {
        status: 'APPROVED',
        verifiedById: me.profile.id,
        verifiedAt: new Date(),
        rejectionReason: null,
      },
    })
    invalidateFinancialViews(tournament.id, [receipt.invoice.tournamentInstitutionId])
    await notifyReceiptApproved({ receiptId: receipt.id, invoiceId: receipt.invoiceId })
    await logActivity({
      action: 'RECEIPT_APPROVED',
      resourceType: 'payment_receipt',
      resourceId: receipt.id,
      description: 'Receipt approved',
      tournamentId: tournament.id,
      actorId: me.profile.id,
      actorRoleAtTime: 'DIRECTOR',
    })
    return { ok: true, data: { receiptId: receipt.id } }
  } catch (e) {
    return toApi(e)
  }
}
