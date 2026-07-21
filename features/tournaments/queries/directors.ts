import { prisma } from '@/lib/prisma'
import type { DirectorWithProfile } from '@/features/tournaments/types'

export async function getDirectorsForTournament(tournamentId: string): Promise<DirectorWithProfile[]> {
  return prisma.tournamentDirector.findMany({
    where: { tournamentId },
    include: { profile: { select: { id: true, displayName: true, avatarUrl: true } } },
    orderBy: { assignedAt: 'asc' },
  })
}

export async function listEligibleDirectorCandidates(tournamentId: string): Promise<
  Array<{ profileId: string; displayName: string; avatarUrl: string | null; role: 'OWNER' | 'MEMBER' }>
> {
  const t = await prisma.tournament.findUnique({ where: { id: tournamentId }, select: { orgId: true } })
  if (!t) return []
  const members = await prisma.organizationMember.findMany({
    where: { orgId: t.orgId },
    include: { profile: { select: { id: true, displayName: true, avatarUrl: true } } },
  })
  const existing = new Set(
    (await prisma.tournamentDirector.findMany({ where: { tournamentId }, select: { profileId: true } }))
      .map((r) => r.profileId),
  )
  return members
    .filter((m) => !existing.has(m.profileId))
    .map((m) => ({
      profileId: m.profileId,
      displayName: m.profile.displayName,
      avatarUrl: m.profile.avatarUrl,
      role: m.role,
    }))
}
