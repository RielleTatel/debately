import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/features/auth/queries'
import type { Tournament } from '@prisma/client'
import type { TournamentListItem } from '@/features/tournaments/types'

function rehydrateTournament(raw: Tournament): Tournament {
  return {
    ...raw,
    startDate: new Date(raw.startDate),
    endDate: new Date(raw.endDate),
    registrationDeadline: new Date(raw.registrationDeadline),
    paymentDeadline: raw.paymentDeadline ? new Date(raw.paymentDeadline) : null,
    archivedAt: raw.archivedAt ? new Date(raw.archivedAt) : null,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  }
}

export const TOURNAMENT_TAG = (id: string) => `tournament:${id}`

export async function listTournamentsForOrg(orgId: string): Promise<Tournament[]> {
  return prisma.tournament.findMany({
    where: { orgId },
    orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
  })
}

export const listTournamentsForCurrentUser = cache(async (): Promise<TournamentListItem[]> => {
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
})

export async function resolveTournamentByOrgAndId(orgSlug: string, tournamentId: string): Promise<Tournament | null> {
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug }, select: { id: true } })
  if (!org) return null
  const t = await prisma.tournament.findUnique({ where: { id: tournamentId } })
  if (!t || t.orgId !== org.id) return null
  return t
}

export async function getTournamentById(tournamentId: string): Promise<Tournament | null> {
  const cached = unstable_cache(
    async () => prisma.tournament.findUnique({ where: { id: tournamentId } }),
    ['tournament-by-id', tournamentId],
    { tags: [TOURNAMENT_TAG(tournamentId)] },
  )
  const raw = await cached()
  return raw ? rehydrateTournament(raw) : null
}
