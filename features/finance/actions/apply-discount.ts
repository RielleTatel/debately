'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import { requireDirectorForInvoice } from '@/features/finance/permissions'
import { assertTournamentEditable } from '@/features/tournaments/permissions'
import { applyDiscountSchema } from '@/features/finance/schemas'
import type { ApiResponse } from '@/types/api'

export async function applyDiscountAction(fd: FormData): Promise<ApiResponse<{ invoiceId: string }>> {
  try {
    const parsed = applyDiscountSchema.safeParse({
      invoiceId: fd.get('invoiceId'), amountInput: fd.get('amountInput'),
      reason: fd.get('reason'), currency: fd.get('currency'),
    })
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', parsed.error.issues[0].message)
    const { invoice, tournament } = await requireDirectorForInvoice(parsed.data.invoiceId)
    assertTournamentEditable(tournament)
    if (parsed.data.amountMinor > invoice.subtotalMinor) throw new AppError('VALIDATION_ERROR', 'Discount cannot exceed subtotal.')
    const totalMinor = invoice.overrideMinor ?? Math.max(0, invoice.subtotalMinor - parsed.data.amountMinor)
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { discountMinor: parsed.data.amountMinor, discountReason: parsed.data.reason, totalMinor },
    })
    const tournamentId = (invoice as any).institution?.tournamentId
    if (tournamentId) revalidatePath(`/tournaments/${tournamentId}/finance/${(invoice as any).institution.id}`)
    return { ok: true, data: { invoiceId: invoice.id } }
  } catch (e) { return toApi(e) }
}
