import { prisma } from '@/lib/prisma'
import type { Participant } from '@prisma/client'

export async function getParticipantsForInstitution(institutionId: string) {
  return prisma.participant.findMany({
    where: { tournamentInstitutionId: institutionId },
    orderBy: { displayName: 'asc' },
    include: { team: true },
  })
}

export async function getParticipantsForTournament(tournamentId: string): Promise<Participant[]> {
  return prisma.participant.findMany({
    where: { institution: { tournamentId } },
    orderBy: [{ institution: { name: 'asc' } }, { displayName: 'asc' }],
    include: { institution: true, team: true },
  })
}
