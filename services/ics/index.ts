import { createEvents, type EventAttributes } from 'ics'
import { prisma } from '@/lib/prisma'

export async function icsForTournament(tournamentId: string): Promise<string> {
  const t = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { schedule: { orderBy: { startAt: 'asc' } } },
  })
  if (!t) throw new Error('Tournament not found')
  const events: EventAttributes[] = t.schedule.map((e) => ({
    uid: `${tournamentId}-${e.id}@debately.app`,
    start: [
      e.startAt.getUTCFullYear(),
      e.startAt.getUTCMonth() + 1,
      e.startAt.getUTCDate(),
      e.startAt.getUTCHours(),
      e.startAt.getUTCMinutes(),
    ] as [number, number, number, number, number],
    end: e.endAt
      ? ([
          e.endAt.getUTCFullYear(),
          e.endAt.getUTCMonth() + 1,
          e.endAt.getUTCDate(),
          e.endAt.getUTCHours(),
          e.endAt.getUTCMinutes(),
        ] as [number, number, number, number, number])
      : ([
          e.startAt.getUTCFullYear(),
          e.startAt.getUTCMonth() + 1,
          e.startAt.getUTCDate(),
          e.startAt.getUTCHours() + 1,
          e.startAt.getUTCMinutes(),
        ] as [number, number, number, number, number]),
    title: e.label,
    description: e.description ?? undefined,
    location: t.venue,
  }))
  const { error, value } = createEvents(events)
  if (error) throw error
  return value ?? ''
}
