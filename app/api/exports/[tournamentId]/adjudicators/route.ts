import { NextRequest, NextResponse } from 'next/server'
import { requireTournamentDirector } from '@/features/tournaments/permissions'
import { streamAdjudicatorsCsv } from '@/services/csv/reports/adjudicators'
import { isAppError } from '@/lib/errors'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ tournamentId: string }> }) {
  try {
    const { tournamentId } = await ctx.params
    await requireTournamentDirector(tournamentId)
    const stream = streamAdjudicatorsCsv(tournamentId)
    return new NextResponse(stream, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="adjudicators-${tournamentId}.csv"`,
      },
    })
  } catch (e) {
    if (isAppError(e)) return new NextResponse(e.message, { status: e.code === 'NOT_FOUND' ? 404 : 403 })
    throw e
  }
}
