'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import { requireDirectorForInvoice } from '@/features/finance/permissions'
import { assertTournamentEditable } from '@/features/tournaments/permissions'
import { overrideTotalSchema } from '@/features/finance/schemas'
import type { ApiResponse } from '@/types/api'

export async function overrideTotalAction(fd: FormData): Promise<ApiResponse<{ invoiceId: string }>> {
  try {
    const parsed = overrideTotalSchema.safeParse({
      invoiceId: fd.get('invoiceId'), amountInput: fd.get('amountInput'),
      reason: fd.get('reason'), currency: fd.get('currency'),
    })
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', parsed.error.issues[0].message)
    const { invoice, tournament, me } = await requireDirectorForInvoice(parsed.data.invoiceId)
    assertTournamentEditable(tournament)
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { overrideMinor: parsed.data.amountMinor, overrideReason: parsed.data.reason, overrideById: me.profile.id, overrideAt: new Date(), totalMinor: parsed.data.amountMinor },
    })
    return { ok: true, data: { invoiceId: invoice.id } }
  } catch (e) { return toApi(e) }
}

export async function clearOverrideAction(fd: FormData): Promise<ApiResponse<{ invoiceId: string }>> {
  try {
    const invoiceId = String(fd.get('invoiceId') ?? '')
    if (!invoiceId) throw new AppError('VALIDATION_ERROR', 'invoiceId required')
    const { invoice, tournament } = await requireDirectorForInvoice(invoiceId)
    assertTournamentEditable(tournament)
    const totalMinor = Math.max(0, invoice.subtotalMinor - invoice.discountMinor)
    await prisma.invoice.update({ where: { id: invoice.id }, data: { overrideMinor: null, overrideReason: null, overrideById: null, overrideAt: null, totalMinor } })
    return { ok: true, data: { invoiceId } }
  } catch (e) { return toApi(e) }
}
