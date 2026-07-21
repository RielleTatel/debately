import { prisma } from '@/lib/prisma'
import type { Team } from '@prisma/client'

export async function getTeamsForInstitution(institutionId: string): Promise<Team[]> {
  return prisma.team.findMany({
    where: { tournamentInstitutionId: institutionId },
    orderBy: { name: 'asc' },
  })
}

export async function getTeamsForTournament(tournamentId: string): Promise<Team[]> {
  return prisma.team.findMany({
    where: { institution: { tournamentId } },
    orderBy: [{ institution: { name: 'asc' } }, { name: 'asc' }],
    include: { institution: true },
  })
}
