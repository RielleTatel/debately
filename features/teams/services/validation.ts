import { prisma } from '@/lib/prisma'
import type { TeamValidationKind } from '@prisma/client'

export type ComputedFlag = { kind: TeamValidationKind; note: string }

export async function computeTeamValidationFlags(teamId: string): Promise<ComputedFlag[]> {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { institution: { select: { tournamentId: true } } },
  })
  if (!team) return []
  const tournament = await prisma.tournament.findUnique({
    where: { id: team.institution.tournamentId },
    select: { formatConfig: true },
  })
  const speakerCount = ((tournament?.formatConfig as { speakerCount?: number } | null)?.speakerCount) ?? 3

  const participants = await prisma.participant.findMany({ where: { teamId } })
  const adjudicators = await prisma.adjudicator.findMany({
    where: { tournamentInstitutionId: team.tournamentInstitutionId, status: 'ACTIVE' },
  })

  const flags: ComputedFlag[] = []
  const activeParticipants = participants.filter((p) => p.eligibility === 'ELIGIBLE')
  if (activeParticipants.length < speakerCount) {
    flags.push({ kind: 'INCOMPLETE', note: `${activeParticipants.length}/${speakerCount} speakers` })
  }
  const ineligible = participants.filter((p) => p.eligibility === 'INELIGIBLE')
  if (ineligible.length > 0) {
    flags.push({ kind: 'INELIGIBLE_SPEAKER', note: `${ineligible.length} ineligible: ${ineligible.map((p) => p.displayName).join(', ')}` })
  }
  if (adjudicators.length === 0) {
    flags.push({ kind: 'MISSING_JUDGE', note: 'No active adjudicator for this institution' })
  }
  return flags
}

export async function recomputeTeamValidation(teamId: string): Promise<void> {
  const flags = await computeTeamValidationFlags(teamId)
  await prisma.$transaction([
    prisma.teamValidationFlag.deleteMany({ where: { teamId } }),
    ...flags.map((f) => prisma.teamValidationFlag.create({ data: { teamId, kind: f.kind, note: f.note } })),
  ])
}
