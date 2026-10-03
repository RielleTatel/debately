import { prisma } from '@/lib/prisma'
import { Errors } from '@/lib/errors'
import { requireTournamentDirector } from '@/features/tournaments/permissions'
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
  if (opts?.mode === 'director') {
    const institution = adjudicator.tournamentInstitutionId
      ? await prisma.tournamentInstitution.findUnique({
          where: { id: adjudicator.tournamentInstitutionId },
        })
      : null
    const { me, tournament } = await requireTournamentDirector(adjudicator.tournamentId)
    return { mode: 'director', adjudicator, institution, tournament, meId: me.profile.id }
  }
  if (!adjudicator.tournamentInstitutionId) throw Errors.forbidden()
  const { me, tournament, institution } = await requireInstitutionRep(
    adjudicator.tournamentInstitutionId,
  )
  if (Date.now() >= tournament.registrationDeadline.getTime()) {
    throw Errors.conflict('Registration deadline has passed; submit a request instead')
  }
  return { mode: 'rep', adjudicator, institution, tournament, meId: me.id }
}
