import { prisma } from '@/lib/prisma'
import { Errors } from '@/lib/errors'
import { requireVerifiedUser } from '@/features/auth/queries'
import type { TournamentInstitution, Tournament, InstitutionClaim } from '@prisma/client'

export type InstitutionRepContext = {
  me: { id: string }
  institution: TournamentInstitution
  tournament: Tournament
  claim: InstitutionClaim
}

export async function requireInstitutionRep(institutionId: string): Promise<InstitutionRepContext> {
  const me = await requireVerifiedUser()
  const institution = await prisma.tournamentInstitution.findUnique({ where: { id: institutionId } })
  if (!institution) throw Errors.notFound('Institution not found')
  const claim = await prisma.institutionClaim.findUnique({ where: { tournamentInstitutionId: institutionId } })
  if (!claim || claim.profileId !== me.profile.id) throw Errors.forbidden()
  const tournament = await prisma.tournament.findUnique({ where: { id: institution.tournamentId } })
  if (!tournament) throw Errors.notFound('Tournament not found')
  return { me: { id: me.profile.id }, institution, tournament, claim }
}
