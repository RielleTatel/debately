import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/features/auth/queries'
import type { TournamentInstitution } from '@prisma/client'

export async function getInstitutionForCurrentUser(
  tournamentId: string,
): Promise<TournamentInstitution | null> {
  const me = await getCurrentUser()
  if (!me) return null
  const claim = await prisma.institutionClaim.findFirst({
    where: { profileId: me.profile.id, institution: { tournamentId } },
    include: { institution: true },
  })
  return claim?.institution ?? null
}
