import { prisma } from '@/lib/prisma'
import { csvStream } from '../stream'

export function streamInstitutionsCsv(tournamentId: string) {
  async function* rows() {
    const list = await prisma.tournamentInstitution.findMany({
      where: { tournamentId },
      include: {
        _count: { select: { teams: true, adjudicators: true, participants: true } },
        claim: { select: { tournamentInstitutionId: true } },
      },
      orderBy: { name: 'asc' },
    })
    for (const i of list) yield i
  }
  return csvStream(
    rows(),
    [
      'id',
      'name',
      'contactEmail',
      'teamsExpected',
      'teamsActual',
      'adjudicatorsExpected',
      'adjudicatorsActual',
      'claimed',
      'participantsActual',
    ],
    (i) => [
      i.id,
      i.name,
      i.contactEmail ?? '',
      i.teamsIntended ?? '',
      i._count.teams,
      i.adjudicatorsIntended ?? '',
      i._count.adjudicators,
      i.claim ? 'yes' : 'no',
      i._count.participants,
    ],
  )
}
