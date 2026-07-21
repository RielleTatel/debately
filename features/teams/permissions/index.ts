import { prisma } from '@/lib/prisma'
import { Errors } from '@/lib/errors'
import { requireTournamentDirector, isBeforeRegistrationDeadline } from '@/features/tournaments/permissions'
import { requireInstitutionRep } from '@/features/portal/permissions'
import type { Team, Tournament, TournamentInstitution } from '@prisma/client'

export type TeamEditorContext = {
  mode: 'rep' | 'director'
  team: Team
  institution: TournamentInstitution
  tournament: Tournament
  meId: string
}

export async function requireTeamEditor(
  teamId: string,
  opts?: { mode?: 'rep' | 'director' },
): Promise<TeamEditorContext> {
  const team = await prisma.team.findUnique({ where: { id: teamId } })
  if (!team) throw Errors.notFound('Team not found')
  const institution = await prisma.tournamentInstitution.findUnique({
    where: { id: team.tournamentInstitutionId },
  })
  if (!institution) throw Errors.notFound('Institution not found')
  if (opts?.mode === 'director') {
    const { me, tournament } = await requireTournamentDirector(institution.tournamentId)
    return { mode: 'director', team, institution, tournament, meId: me.profile.id }
  }
  const { me, tournament } = await requireInstitutionRep(institution.id)
  if (!(await isBeforeRegistrationDeadline(tournament.id))) {
    throw Errors.conflict('Registration deadline has passed; submit a request instead')
  }
  return { mode: 'rep', team, institution, tournament, meId: me.id }
}
