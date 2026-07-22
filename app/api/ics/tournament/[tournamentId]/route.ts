import { NextRequest, NextResponse } from 'next/server'
import { icsForTournament } from '@/services/ics'

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ tournamentId: string }> },
) {
  const { tournamentId } = await ctx.params
  const ics = await icsForTournament(tournamentId)
  return new NextResponse(ics, {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': `attachment; filename="tournament-${tournamentId}.ics"`,
    },
  })
}
