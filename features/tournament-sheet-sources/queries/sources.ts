import { prisma } from '@/lib/prisma'

export async function listSourcesForTournament(tournamentId: string) {
  return prisma.tournamentSheetSource.findMany({
    where: { tournamentId },
    orderBy: [{ phase: 'asc' }, { createdAt: 'asc' }],
  })
}

export async function getSourceById(sourceId: string) {
  return prisma.tournamentSheetSource.findUnique({ where: { id: sourceId } })
}
