import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/errors'
import { requireTournamentDirector } from '@/features/tournaments/permissions'

export async function requireDirectorForSource(sourceId: string) {
  const source = await prisma.tournamentSheetSource.findUnique({
    where: { id: sourceId },
    select: {
      id: true,
      tournamentId: true,
      phase: true,
      spreadsheetId: true,
      sheetTabName: true,
      columnMapping: true,
      active: true,
    },
  })
  if (!source) throw new AppError('NOT_FOUND', 'Sheet source not found', 404)
  const ctx = await requireTournamentDirector(source.tournamentId)
  return { source, ...ctx }
}
