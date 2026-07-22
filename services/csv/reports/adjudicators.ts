import { prisma } from '@/lib/prisma'
import { csvStream } from '../stream'

export function streamAdjudicatorsCsv(tournamentId: string) {
  async function* rows() {
    const list = await prisma.adjudicator.findMany({
      where: { tournamentId },
      include: { institution: { select: { name: true } } },
      orderBy: { displayName: 'asc' },
    })
    for (const a of list) yield a
  }
  return csvStream(
    rows(),
    ['id', 'displayName', 'email', 'institution', 'status', 'experience'],
    (a) => [
      a.id,
      a.displayName,
      a.email ?? '',
      a.institution?.name ?? 'Independent',
      a.status,
      a.experienceLevel ?? '',
    ],
  )
}
