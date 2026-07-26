import { prisma } from '@/lib/prisma'
import type { TournamentPayment } from '@prisma/client'

export async function getPaymentsForInstitution(
  tournamentInstitutionId: string,
): Promise<TournamentPayment[]> {
  return prisma.tournamentPayment.findMany({
    where: { tournamentInstitutionId },
    orderBy: { createdAt: 'asc' },
  })
}

export async function getPaymentTotalsForTournament(
  tournamentId: string,
): Promise<Map<string, { totalMinor: number; currency: string }>> {
  const payments = await prisma.tournamentPayment.findMany({
    where: { tournamentId, status: { not: 'VOIDED' } },
    select: { tournamentInstitutionId: true, amountMinor: true, currency: true },
  })
  const out = new Map<string, { totalMinor: number; currency: string }>()
  for (const p of payments) {
    const existing = out.get(p.tournamentInstitutionId)
    out.set(p.tournamentInstitutionId, {
      totalMinor: (existing?.totalMinor ?? 0) + p.amountMinor,
      currency: p.currency,
    })
  }
  return out
}
