import { prisma } from '@/lib/prisma'
import type { ReceiptWithUploader } from '../types'

export async function listReceiptsForInvoice(invoiceId: string): Promise<ReceiptWithUploader[]> {
  return prisma.paymentReceipt.findMany({
    where: { invoiceId },
    include: { uploader: { select: { displayName: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  })
}
