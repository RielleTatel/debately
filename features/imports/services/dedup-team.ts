import { prisma } from '@/lib/prisma'
import type { Team } from '@prisma/client'

export async function matchTeam(tournamentInstitutionId: string, teamName: string): Promise<Team | null> {
  const name = teamName.trim()
  if (!name) return null
  return prisma.team.findUnique({
    where: { tournamentInstitutionId_name: { tournamentInstitutionId, name } },
  })
}
