import { prisma } from '@/lib/prisma'
import { Errors } from '@/lib/errors'
import { requireTournamentDirector, isBeforeRegistrationDeadline } from '@/features/tournaments/permissions'
import { requireInstitutionRep } from '@/features/portal/permissions'
import type { Adjudicator, Tournament, TournamentInstitution } from '@prisma/client'

export type AdjudicatorEditorContext = {
  mode: 'rep' | 'director'
  adjudicator: Adjudicator
  institution: TournamentInstitution | null
  tournament: Tournament
  meId: string
}

export async function requireAdjudicatorEditor(
  adjudicatorId: string,
  opts?: { mode?: 'rep' | 'director' },
): Promise<AdjudicatorEditorContext> {
  const adjudicator = await prisma.adjudicator.findUnique({ where: { id: adjudicatorId } })
  if (!adjudicator) throw Errors.notFound('Adjudicator not found')
  const institution = adjudicator.tournamentInstitutionId
    ? await prisma.tournamentInstitution.findUnique({ where: { id: adjudicator.tournamentInstitutionId } })
    : null
  if (opts?.mode === 'director') {
    const { me, tournament } = await requireTournamentDirector(adjudicator.tournamentId)
    return { mode: 'director', adjudicator, institution, tournament, meId: me.profile.id }
  }
  if (!institution) throw Errors.forbidden()
  const { me, tournament } = await requireInstitutionRep(institution.id)
  if (!(await isBeforeRegistrationDeadline(tournament.id))) {
    throw Errors.conflict('Registration deadline has passed; submit a request instead')
  }
  return { mode: 'rep', adjudicator, institution, tournament, meId: me.id }
}
