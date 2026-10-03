import { publicTournamentTag } from '@/lib/cache-tags'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { readPage, type SearchParams } from '@/lib/pagination'
import { ORG_TAG } from '@/features/organizations/queries/current-org'
export const PUBLIC_TOURNAMENT_TAG = publicTournamentTag

export const getPublicTournamentBySlug = cache(async (slug: string) => {
  const visible = await prisma.tournament.findFirst({
    where: { slug, publicPageEnabled: true },
    select: { id: true, organization: { select: { slug: true } } },
  })
  if (!visible) return null
  const raw = await unstable_cache(
    () =>
      prisma.tournament.findUnique({
        where: { id: visible.id },
        select: {
          id: true,
          slug: true,
          name: true,
          startDate: true,
          endDate: true,
          venue: true,
          address: true,
          description: true,
          organization: { select: { name: true, logoUrl: true } },
          publicAssets: {
            select: { id: true, kind: true, label: true, storagePath: true },
            orderBy: { id: 'asc' },
          },
          contacts: {
            select: { id: true, name: true, email: true, socialLinks: true },
            orderBy: { id: 'asc' },
          },
          schedule: {
            select: {
              id: true,
              label: true,
              kind: true,
              startAt: true,
              endAt: true,
              description: true,
            },
            orderBy: [{ startAt: 'asc' }, { id: 'asc' }],
          },
        },
      }),
    ['public-tournament', visible.id],
    {
      revalidate: 60,
      tags: [PUBLIC_TOURNAMENT_TAG(visible.id), ORG_TAG(visible.organization.slug)],
    },
  )()
  return raw
    ? {
        ...raw,
        startDate: new Date(raw.startDate),
        endDate: new Date(raw.endDate),
        schedule: raw.schedule.map((entry) => ({
          ...entry,
          startAt: new Date(entry.startAt),
          endAt: entry.endAt ? new Date(entry.endAt) : null,
        })),
      }
    : null
})

export async function getPublicInstitutions(tournamentId: string, search: SearchParams = {}) {
  const paging = readPage(search)
  const result = await unstable_cache(
    async () => {
      const [rows, total] = await Promise.all([
        prisma.tournamentInstitution.findMany({
          where: { tournamentId },
          select: { id: true, name: true, logoUrl: true },
          orderBy: [{ name: 'asc' }, { id: 'asc' }],
          take: paging.pageSize,
          skip: paging.skip,
        }),
        prisma.tournamentInstitution.count({ where: { tournamentId } }),
      ])
      return { rows, total }
    },
    ['public-institutions', tournamentId, String(paging.page), String(paging.pageSize)],
    { revalidate: 60, tags: [PUBLIC_TOURNAMENT_TAG(tournamentId)] },
  )()
  return { ...result, paging }
}
