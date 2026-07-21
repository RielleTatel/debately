import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/errors'
import { evaluateFeeStructure } from './fee-evaluator'
import type { Invoice, Prisma } from '@prisma/client'

type Tx = Prisma.TransactionClient | typeof prisma

export async function nextInvoiceNumber(tournamentId: string, tx: Tx): Promise<string> {
  const t = await tx.tournament.findUnique({ where: { id: tournamentId }, select: { slug: true } })
  if (!t) throw new AppError('NOT_FOUND', 'Tournament not found')
  const existing = await tx.invoice.count({ where: { institution: { tournamentId } } })
  const seq = String(existing + 1).padStart(4, '0')
  const slugPart = t.slug.toUpperCase().replace(/[^A-Z0-9]+/g, '-')
  return `INV-${slugPart}-${seq}`
}

export async function regenerateInvoiceForInstitution(
  tournamentInstitutionId: string,
  externalTx?: Tx,
): Promise<Invoice> {
  const run = async (tx: Tx): Promise<Invoice> => {
    const institution = await tx.tournamentInstitution.findUnique({
      where: { id: tournamentInstitutionId },
      include: { tournament: { select: { id: true, feeStructure: true, currency: true } } },
    })
    if (!institution) throw new AppError('NOT_FOUND', 'Institution not found')

    const [teamCount, adjudicatorCount] = await Promise.all([
      tx.team.count({ where: { tournamentInstitutionId } }),
      tx.adjudicator.count({ where: { tournamentInstitutionId } }),
    ])

    const feeStructure = (institution.tournament.feeStructure as unknown as { kind: string; lines: { label: string; amount: number; unit: string }[] }) ?? { kind: 'none', lines: [] }
    const currency = institution.tournament.currency
    const { lineItems, subtotalMinor } = evaluateFeeStructure({
      feeStructure: feeStructure as any, teamCount, adjudicatorCount, currency,
    })

    const existing = await tx.invoice.findUnique({ where: { tournamentInstitutionId }, select: { id: true, discountMinor: true, overrideMinor: true, invoiceNumber: true } })
    const discountMinor = existing?.discountMinor ?? 0
    const overrideMinor = existing?.overrideMinor ?? null
    const totalMinor = overrideMinor ?? Math.max(0, subtotalMinor - discountMinor)
    const invoiceNumber = existing?.invoiceNumber ?? await nextInvoiceNumber(institution.tournament.id, tx)

    const invoice = await tx.invoice.upsert({
      where: { tournamentInstitutionId },
      create: { tournamentInstitutionId, invoiceNumber, subtotalMinor, discountMinor, totalMinor, currency },
      update: { subtotalMinor, totalMinor },
    })

    await tx.invoiceLineItem.deleteMany({ where: { invoiceId: invoice.id } })
    if (lineItems.length > 0) {
      await tx.invoiceLineItem.createMany({
        data: lineItems.map((l) => ({
          invoiceId: invoice.id, kind: l.kind, label: l.label,
          quantity: l.quantity, unitPriceMinor: l.unitPriceMinor, subtotalMinor: l.subtotalMinor,
        })),
      })
    }
    return invoice
  }
  if (externalTx) return run(externalTx)
  return prisma.$transaction(run)
}
