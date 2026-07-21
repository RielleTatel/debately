import { prisma } from '@/lib/prisma'
import type { TournamentInstitution } from '@prisma/client'

export async function getInstitutionsForTournament(tournamentId: string): Promise<TournamentInstitution[]> {
  return prisma.tournamentInstitution.findMany({
    where: { tournamentId },
    orderBy: { name: 'asc' },
  })
}

export async function getInstitutionById(id: string): Promise<TournamentInstitution | null> {
  return prisma.tournamentInstitution.findUnique({ where: { id } })
}

export async function resolveInstitutionByName(
  tournamentId: string,
  name: string,
): Promise<TournamentInstitution | null> {
  const target = name.trim().toLowerCase()
  const inst = await prisma.tournamentInstitution.findFirst({
    where: { tournamentId, name: { equals: name, mode: 'insensitive' } },
  })
  if (inst) return inst
  const alias = await prisma.institutionAlias.findFirst({
    where: { tournamentId, alias: target },
    include: { resolvedInstitution: true },
  })
  return alias?.resolvedInstitution ?? null
}

export async function resolveInstitutionRecipients(tournamentId: string): Promise<string[]> {
  const claims = await prisma.institutionClaim.findMany({
    where: { institution: { tournamentId } },
    select: { profileId: true },
  })
  return claims.map((c) => c.profileId)
}
