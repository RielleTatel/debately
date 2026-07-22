import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { requireVerifiedUser } from '@/features/auth/queries'
import { AppError, Errors } from '@/lib/errors'
import type { Tournament, Organization, OrganizationRole } from '@prisma/client'

type CurrentUser = Awaited<ReturnType<typeof requireVerifiedUser>>

export async function isDirectorOf(profileId: string, tournamentId: string): Promise<boolean> {
  const row = await prisma.tournamentDirector.findUnique({
    where: { tournamentId_profileId: { tournamentId, profileId } },
    select: { id: true },
  })
  return !!row
}

export const requireTournamentReadable = cache(async (tournamentId: string): Promise<{
  me: CurrentUser
  tournament: Tournament
  org: Organization
  role: OrganizationRole
  isDirector: boolean
}> => {
  const [me, tRes] = await Promise.all([
    requireVerifiedUser(),
    prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { organization: true },
    }),
  ])
  if (!tRes) throw Errors.notFound('Tournament')
  const { organization: org, ...tournament } = tRes
  const membership = await prisma.organizationMember.findUnique({
    where: { orgId_profileId: { orgId: org.id, profileId: me.profile.id } },
    select: { role: true },
  })
  if (!membership) throw Errors.forbidden()
  const isDirector = membership.role === 'OWNER' || (await isDirectorOf(me.profile.id, tournament.id))
  return { me, tournament, org, role: membership.role, isDirector }
})

export async function requireTournamentDirector(tournamentId: string): Promise<{
  me: CurrentUser
  tournament: Tournament
  org: Organization
}> {
  const ctx = await requireTournamentReadable(tournamentId)
  if (!ctx.isDirector) throw new AppError('FORBIDDEN', 'Only tournament directors can perform this action', 403)
  return { me: ctx.me, tournament: ctx.tournament, org: ctx.org }
}

export function assertTournamentEditable(tournament: Pick<Tournament, 'status'>): void {
  if (tournament.status === 'COMPLETED' || tournament.status === 'ARCHIVED') {
    throw new AppError('CONFLICT', `Tournament is ${tournament.status.toLowerCase()} and cannot be edited`, 409)
  }
}


export async function isBeforeRegistrationDeadline(tournamentId: string): Promise<boolean> {
  const t = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { registrationDeadline: true },
  })
  if (!t) return false
  return Date.now() < new Date(t.registrationDeadline).getTime()
}
