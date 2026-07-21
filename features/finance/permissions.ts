import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/errors'
import { requireTournamentDirector } from '@/features/tournaments/permissions'
import { requireInstitutionRep } from '@/features/portal/permissions'
import type { Tournament } from '@prisma/client'

export async function requireDirectorForInvoice(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { institution: { select: { tournamentId: true, id: true } } },
  })
  if (!invoice) throw new AppError('NOT_FOUND', 'Invoice not found')
  const ctx = await requireTournamentDirector(invoice.institution.tournamentId)
  return { invoice, ...ctx }
}

export async function requireRepForInvoice(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { institution: { select: { tournamentId: true, id: true } } },
  })
  if (!invoice) throw new AppError('NOT_FOUND', 'Invoice not found')
  const ctx = await requireInstitutionRep(invoice.institution.id)
  return { invoice, ...ctx }
}

export async function requireDirectorForReceipt(receiptId: string) {
  const receipt = await prisma.paymentReceipt.findUnique({
    where: { id: receiptId },
    include: { invoice: { include: { institution: { select: { tournamentId: true, id: true } } } } },
  })
  if (!receipt) throw new AppError('NOT_FOUND', 'Receipt not found')
  const ctx = await requireTournamentDirector(receipt.invoice.institution.tournamentId)
  return { receipt, ...ctx }
}

export function assertPaymentActionsAllowed(tournament: Pick<Tournament, 'status'>): void {
  if (tournament.status === 'ARCHIVED') throw new AppError('CONFLICT', 'Tournament is archived — payment actions are disabled.')
}
