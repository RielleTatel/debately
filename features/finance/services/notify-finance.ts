import { notificationService } from '@/services/notifications'

export async function notifyReceiptSubmitted(input: { receiptId: string; invoiceId: string }): Promise<void> {
  notificationService.send({ userId: 'director', type: 'PAYMENT_RECEIPT_SUBMITTED', title: 'Receipt submitted', message: `Receipt ${input.receiptId} submitted`, tournamentId: undefined, link: undefined } as any)
}

export async function notifyReceiptApproved(input: { receiptId: string; invoiceId: string }): Promise<void> {
  notificationService.send({ userId: 'rep', type: 'PAYMENT_RECEIPT_APPROVED', title: 'Receipt approved', message: `Receipt ${input.receiptId} approved`, tournamentId: undefined, link: undefined } as any)
}

export async function notifyReceiptRejected(input: { receiptId: string; invoiceId: string; reason: string }): Promise<void> {
  notificationService.send({ userId: 'rep', type: 'PAYMENT_RECEIPT_REJECTED', title: 'Receipt rejected', message: input.reason, tournamentId: undefined, link: undefined } as any)
}

export async function notifyPaymentReminder(input: { invoiceIds: string[] }): Promise<void> {
  notificationService.send({ userId: 'rep', type: 'PAYMENT_REMINDER', title: 'Payment reminder', message: `Reminder for ${input.invoiceIds.length} invoice(s)`, tournamentId: undefined, link: undefined } as any)
}
