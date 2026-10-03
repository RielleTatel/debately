import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { setAnalyticsFailure, setRosterDelays } from '../../../fixtures/prisma'
import { revalidateTag } from 'next/cache'
import { updateTournamentBasicAction } from '@/features/tournaments/actions/update'
export async function POST(request: Request) {
  const state: {
    publicPageEnabled?: boolean
    deadline?: string
    failAnalytics?: boolean
    analyticsDelayMs?: number
    rosterDelayMs?: number
    balanceDelayMs?: number
    metadata?: { name: string; slug: string }
  } = await request.json()
  if (state.metadata) {
    const tournament = await prisma.tournament.findUniqueOrThrow({
      where: { id: 'fixture-tournament' },
    })
    const fd = new FormData()
    for (const [key, value] of Object.entries({
      tournamentId: tournament.id,
      name: state.metadata.name,
      slug: state.metadata.slug,
      description: tournament.description ?? '',
      venue: tournament.venue,
      address: tournament.address,
      startDate: tournament.startDate.toISOString(),
      endDate: tournament.endDate.toISOString(),
    }))
      fd.set(key, value)
    return NextResponse.json(await updateTournamentBasicAction(fd))
  }
  if (state.failAnalytics !== undefined) {
    setAnalyticsFailure(state.failAnalytics, state.analyticsDelayMs)
    revalidateTag('registration-analytics:fixture-tournament')
  }
  if (state.rosterDelayMs !== undefined || state.balanceDelayMs !== undefined)
    setRosterDelays(state.rosterDelayMs, state.balanceDelayMs)
  if (typeof state.publicPageEnabled === 'boolean')
    await prisma.tournament.update({
      where: { id: 'fixture-tournament' },
      data: { publicPageEnabled: state.publicPageEnabled },
    })
  if (state.deadline)
    await prisma.tournament.update({
      where: { id: 'fixture-tournament' },
      data: { registrationDeadline: new Date(state.deadline) },
    })
  return NextResponse.json({ ok: true })
}
