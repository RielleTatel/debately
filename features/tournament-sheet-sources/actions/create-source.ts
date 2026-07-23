'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import { requireTournamentDirector } from '@/features/tournaments/permissions'
import { createSourceSchema } from '../schemas'
import { detectSheetHeaders } from '../services/detect-headers'
import type { ApiResponse } from '@/types/api'

export async function createSourceAction(fd: FormData): Promise<ApiResponse<{ sourceId: string }>> {
  try {
    const parsed = createSourceSchema.safeParse({
      tournamentId: fd.get('tournamentId'),
      phase: fd.get('phase'),
      spreadsheetId: fd.get('spreadsheetId'),
      sheetTabName: fd.get('sheetTabName') ? String(fd.get('sheetTabName')) : null,
    })
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', parsed.error.issues[0].message)

    await requireTournamentDirector(parsed.data.tournamentId)

    await detectSheetHeaders(parsed.data.spreadsheetId, parsed.data.sheetTabName)

    const existing = await prisma.tournamentSheetSource.findFirst({
      where: {
        spreadsheetId: parsed.data.spreadsheetId,
        sheetTabName: parsed.data.sheetTabName ?? null,
      },
      select: { id: true },
    })
    if (existing) throw new AppError('CONFLICT', 'This spreadsheet + tab is already registered.', 409)

    const source = await prisma.tournamentSheetSource.create({
      data: {
        tournamentId: parsed.data.tournamentId,
        phase: parsed.data.phase,
        spreadsheetId: parsed.data.spreadsheetId,
        sheetTabName: parsed.data.sheetTabName ?? null,
      },
      select: { id: true },
    })

    revalidatePath(`/tournaments/${parsed.data.tournamentId}/settings/registration-sources`)
    return { ok: true, data: { sourceId: source.id } }
  } catch (e) {
    return toApi(e)
  }
}
