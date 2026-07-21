'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import { requireRepForInvoice } from '@/features/finance/permissions'
import { submitReceiptSchema } from '@/features/finance/schemas'
import { paymentReceiptsStorage } from '@/services/storage/payment-receipts'
import { notifyReceiptSubmitted } from '@/features/finance/services/notify-finance'
import type { ApiResponse } from '@/types/api'

export async function submitReceiptAction(fd: FormData): Promise<ApiResponse<{ receiptId: string }>> {
  try {
    const parsed = submitReceiptSchema.safeParse({
      invoiceId: fd.get('invoiceId'), amountInput: fd.get('amountInput'),
      currency: fd.get('currency'), paymentDate: fd.get('paymentDate'),
      referenceNumber: fd.get('referenceNumber'), method: fd.get('method'),
    })
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', parsed.error.issues[0].message)
    const file = fd.get('file')
    if (!(file instanceof File)) throw new AppError('VALIDATION_ERROR', 'Receipt file required')
    const { invoice, me } = await requireRepForInvoice(parsed.data.invoiceId)
    paymentReceiptsStorage.validate(file)
    const storagePath = await paymentReceiptsStorage.upload(invoice.id, file)
    const receipt = await prisma.paymentReceipt.create({
      data: {
        invoiceId: invoice.id, uploaderId: me.id, amountMinor: parsed.data.amountMinor,
        paymentDate: parsed.data.paymentDate, referenceNumber: parsed.data.referenceNumber,
        method: parsed.data.method, storagePath, status: 'SUBMITTED',
      },
    })
    await notifyReceiptSubmitted({ receiptId: receipt.id, invoiceId: invoice.id })
    const tournamentId = (invoice as any).institution?.tournamentId
    if (tournamentId) {
      revalidatePath(`/tournaments/${tournamentId}/finance`)
      revalidatePath(`/tournaments/${tournamentId}/finance/${(invoice as any).institution.id}`)
    }
    return { ok: true, data: { receiptId: receipt.id } }
  } catch (e) { return toApi(e) }
}
