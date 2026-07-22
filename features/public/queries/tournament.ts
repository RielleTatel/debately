import { prisma } from '@/lib/prisma'

export async function getPublicTournamentBySlug(slug: string) {
  const t = await prisma.tournament.findFirst({
    where: { slug, publicPageEnabled: true },
    include: {
      organization: { select: { name: true, logoUrl: true } },
      publicAssets: true,
      contacts: true,
      schedule: { orderBy: { startAt: 'asc' } },
    },
  })
  return t
}

export async function getPublicInstitutions(tournamentId: string) {
  return prisma.tournamentInstitution.findMany({
    where: { tournamentId },
    select: { id: true, name: true, logoUrl: true },
    orderBy: { name: 'asc' },
  })
}
