'use server'
import { invalidateFinancialViews } from '@/features/tournaments/services/invalidate-views'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import {
  requireDirectorForReceipt,
  assertPaymentActionsAllowed,
} from '@/features/finance/permissions'
import { rejectReceiptSchema } from '@/features/finance/schemas'
import { notifyReceiptRejected } from '@/features/finance/services/notify-finance'
import type { ApiResponse } from '@/types/api'

export async function rejectReceiptAction(
  fd: FormData,
): Promise<ApiResponse<{ receiptId: string }>> {
  try {
    const parsed = rejectReceiptSchema.safeParse({
      receiptId: fd.get('receiptId'),
      reason: fd.get('reason'),
    })
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', parsed.error.issues[0].message)
    const { receipt, tournament, me } = await requireDirectorForReceipt(parsed.data.receiptId)
    assertPaymentActionsAllowed(tournament)
    if (receipt.status !== 'SUBMITTED')
      throw new AppError('CONFLICT', `Receipt already ${receipt.status.toLowerCase()}.`)
    await prisma.paymentReceipt.update({
      where: { id: receipt.id },
      data: {
        status: 'REJECTED',
        verifiedById: me.profile.id,
        verifiedAt: new Date(),
        rejectionReason: parsed.data.reason,
      },
    })
    invalidateFinancialViews(tournament.id, [receipt.invoice.tournamentInstitutionId])
    await notifyReceiptRejected({
      receiptId: receipt.id,
      invoiceId: receipt.invoiceId,
      reason: parsed.data.reason,
    })
    return { ok: true, data: { receiptId: receipt.id } }
  } catch (e) {
    return toApi(e)
  }
}
