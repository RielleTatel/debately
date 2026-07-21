import { prisma } from '@/lib/prisma'
import { Errors } from '@/lib/errors'
import { requireTournamentDirector, isBeforeRegistrationDeadline } from '@/features/tournaments/permissions'
import { requireInstitutionRep } from '@/features/portal/permissions'
import type { Participant, Tournament, TournamentInstitution } from '@prisma/client'

export type ParticipantEditorContext = {
  mode: 'rep' | 'director'
  participant: Participant
  institution: TournamentInstitution
  tournament: Tournament
  meId: string
}

export async function requireParticipantEditor(
  participantId: string,
  opts?: { mode?: 'rep' | 'director' },
): Promise<ParticipantEditorContext> {
  const participant = await prisma.participant.findUnique({ where: { id: participantId } })
  if (!participant) throw Errors.notFound('Participant not found')
  const institution = await prisma.tournamentInstitution.findUnique({
    where: { id: participant.tournamentInstitutionId },
  })
  if (!institution) throw Errors.notFound('Institution not found')
  if (opts?.mode === 'director') {
    const { me, tournament } = await requireTournamentDirector(institution.tournamentId)
    return { mode: 'director', participant, institution, tournament, meId: me.profile.id }
  }
  const { me, tournament } = await requireInstitutionRep(institution.id)
  if (!(await isBeforeRegistrationDeadline(tournament.id))) {
    throw Errors.conflict('Registration deadline has passed; submit a request instead')
  }
  return { mode: 'rep', participant, institution, tournament, meId: me.id }
}
