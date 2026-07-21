import { prisma } from '@/lib/prisma'
import type { TournamentScheduleEntry } from '@prisma/client'

export async function getScheduleEntries(tournamentId: string): Promise<TournamentScheduleEntry[]> {
  return prisma.tournamentScheduleEntry.findMany({
    where: { tournamentId },
    orderBy: [{ startAt: 'asc' }, { createdAt: 'asc' }],
  })
}
