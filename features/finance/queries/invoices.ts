import { prisma } from '@/lib/prisma'
import type { InvoiceWithLineItems, InvoiceWithInstitution } from '../types'

export async function listInvoicesForTournament(tournamentId: string): Promise<InvoiceWithInstitution[]> {
  return prisma.invoice.findMany({
    where: { institution: { tournamentId } },
    include: { institution: { select: { id: true, name: true } } },
    orderBy: { invoiceNumber: 'asc' },
  })
}

export async function getInvoiceForInstitution(tournamentInstitutionId: string): Promise<InvoiceWithLineItems | null> {
  return prisma.invoice.findUnique({
    where: { tournamentInstitutionId },
    include: { lineItems: { orderBy: { createdAt: 'asc' } } },
  })
}
