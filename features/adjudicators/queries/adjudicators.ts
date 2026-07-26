import { prisma } from '@/lib/prisma'

export async function getAdjudicatorsForTournament(tournamentId: string) {
  return prisma.adjudicator.findMany({
    where: { tournamentId },
    orderBy: [{ status: 'asc' }, { displayName: 'asc' }],
    include: { institution: true },
  })
}

export async function getAdjudicatorsForInstitution(institutionId: string) {
  return prisma.adjudicator.findMany({
    where: { tournamentInstitutionId: institutionId },
    orderBy: { displayName: 'asc' },
  })
}
