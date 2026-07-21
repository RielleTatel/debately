'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import { requireTournamentDirector, assertTournamentEditable } from '@/features/tournaments/permissions'
import { notifyPaymentReminder } from '@/features/finance/services/notify-finance'
import { computePaymentStatus } from '@/features/finance/services/payment-calculator'
import { sendReminderSchema } from '@/features/finance/schemas'
import type { ApiResponse } from '@/types/api'

const THROTTLE_MS = 24 * 60 * 60 * 1000

export async function sendPaymentReminderAction(fd: FormData): Promise<ApiResponse<{ sent: string[]; skipped: Array<{ institutionId: string; reason: string }> }>> {
  try {
    const institutionIds = fd.getAll('institutionIds').map(String).filter(Boolean)
    const parsed = sendReminderSchema.safeParse({ tournamentId: fd.get('tournamentId'), institutionIds })
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', parsed.error.issues[0].message)
    const { tournament, me } = await requireTournamentDirector(parsed.data.tournamentId)
    assertTournamentEditable(tournament)
    const institutions = await prisma.tournamentInstitution.findMany({
      where: { id: { in: parsed.data.institutionIds }, tournamentId: parsed.data.tournamentId },
      include: { invoice: { select: { id: true, totalMinor: true } } },
    })
    const invoiceIds = institutions.map((i) => i.invoice?.id).filter(Boolean) as string[]
    const cutoff = new Date(Date.now() - THROTTLE_MS)
    const recent = await prisma.paymentReminderLog.findMany({ where: { invoiceId: { in: invoiceIds }, sentAt: { gte: cutoff } }, select: { invoiceId: true } })
    const throttled = new Set(recent.map((r) => r.invoiceId))
    const sent: string[] = []; const skipped: Array<{ institutionId: string; reason: string }> = []
    const toLog: Array<{ invoiceId: string; sentById: string }> = []; const toNotify: string[] = []
    for (const ins of institutions) {
      if (!ins.invoice) { skipped.push({ institutionId: ins.id, reason: 'NO_INVOICE' }); continue }
      if (throttled.has(ins.invoice.id)) { skipped.push({ institutionId: ins.id, reason: 'THROTTLED' }); continue }
      const paidAgg = await prisma.paymentReceipt.aggregate({ where: { invoiceId: ins.invoice.id, status: 'APPROVED' }, _sum: { amountMinor: true } })
      const paid = paidAgg._sum.amountMinor ?? 0
      const status = computePaymentStatus({ totalMinor: ins.invoice.totalMinor, paidMinor: paid })
      if (status === 'PAID' || status === 'OVERPAID') { skipped.push({ institutionId: ins.id, reason: 'PAID' }); continue }
      sent.push(ins.id); toLog.push({ invoiceId: ins.invoice.id, sentById: me.profile.id }); toNotify.push(ins.invoice.id)
    }
    if (toLog.length > 0) await prisma.paymentReminderLog.createMany({ data: toLog })
    if (toNotify.length > 0) await notifyPaymentReminder({ invoiceIds: toNotify })
    revalidatePath(`/tournaments/${parsed.data.tournamentId}/finance`)
    return { ok: true, data: { sent, skipped } }
  } catch (e) { return toApi(e) }
}
