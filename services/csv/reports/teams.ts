import { prisma } from '@/lib/prisma'
import { csvStream } from '../stream'

export function streamTeamsCsv(tournamentId: string) {
  async function* rows() {
    const list = await prisma.team.findMany({
      where: { institution: { tournamentId } },
      include: {
        institution: { select: { name: true } },
        _count: { select: { participants: true } },
      },
      orderBy: { name: 'asc' },
    })
    for (const t of list) yield t
  }
  return csvStream(
    rows(),
    ['id', 'name', 'institution', 'novice', 'participantCount', 'importPhase'],
    (t) => [t.id, t.name, t.institution.name, t.isNovice ? 'yes' : 'no', t._count.participants, t.importPhase],
  )
}
