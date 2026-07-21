import { prisma } from '@/lib/prisma'
import { requireUser } from '@/features/auth/queries'
import type { Tournament } from '@prisma/client'
import type { TournamentListItem } from '@/features/tournaments/types'

export async function listTournamentsForOrg(orgId: string): Promise<Tournament[]> {
  return prisma.tournament.findMany({
    where: { orgId },
    orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
  })
}

export async function listTournamentsForCurrentUser(): Promise<TournamentListItem[]> {
  const me = await requireUser()
  const rows = await prisma.tournament.findMany({
    where: { organization: { members: { some: { profileId: me.profile.id } } } },
    include: { organization: { select: { slug: true, name: true } } },
    orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
  })
  return rows.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    status: t.status,
    startDate: t.startDate,
    endDate: t.endDate,
    logoUrl: t.logoUrl,
    orgSlug: t.organization.slug,
    orgName: t.organization.name,
  }))
}

export async function resolveTournamentByOrgAndId(orgSlug: string, tournamentId: string): Promise<Tournament | null> {
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug }, select: { id: true } })
  if (!org) return null
  const t = await prisma.tournament.findUnique({ where: { id: tournamentId } })
  if (!t || t.orgId !== org.id) return null
  return t
}

export async function getTournamentById(tournamentId: string): Promise<Tournament | null> {
  return prisma.tournament.findUnique({ where: { id: tournamentId } })
}
