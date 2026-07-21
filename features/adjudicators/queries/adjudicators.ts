import { prisma } from '@/lib/prisma'
import type { Adjudicator } from '@prisma/client'

export async function getAdjudicatorsForTournament(tournamentId: string): Promise<Adjudicator[]> {
  return prisma.adjudicator.findMany({
    where: { tournamentId },
    orderBy: [{ status: 'asc' }, { displayName: 'asc' }],
    include: { institution: true },
  })
}

export async function getAdjudicatorsForInstitution(institutionId: string): Promise<Adjudicator[]> {
  return prisma.adjudicator.findMany({
    where: { tournamentInstitutionId: institutionId },
    orderBy: { displayName: 'asc' },
  })
}
