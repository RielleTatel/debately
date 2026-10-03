import { prisma } from '@/lib/prisma'
import { Errors } from '@/lib/errors'
import { requireVerifiedUser } from '@/features/auth/queries'
import type { TournamentInstitution, Tournament, InstitutionClaim } from '@prisma/client'
import { cache } from 'react'

export type InstitutionRepContext = {
  me: { id: string }
  institution: TournamentInstitution
  tournament: Tournament
  claim: InstitutionClaim
}

export const requireInstitutionRep = cache(
  async (institutionId: string): Promise<InstitutionRepContext> => {
    const [me, result] = await Promise.all([
      requireVerifiedUser(),
      prisma.tournamentInstitution.findUnique({
        where: { id: institutionId },
        include: { claim: true, tournament: true },
      }),
    ])
    if (!result) throw Errors.notFound('Institution not found')
    const { claim, tournament, ...institution } = result
    if (!claim || claim.profileId !== me.profile.id) throw Errors.forbidden()
    return { me: { id: me.profile.id }, institution, tournament, claim }
  },
)
