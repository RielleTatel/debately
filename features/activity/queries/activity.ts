import { prisma } from '@/lib/prisma'
import type { ActivityAction } from '@prisma/client'

export type ActivityFilters = { actorId?: string; action?: ActivityAction; resourceType?: string; from?: Date; to?: Date; take?: number }

export async function listActivityLogForTournament(tournamentId: string, filters: ActivityFilters = {}) {
  return prisma.activityLog.findMany({
    where: {
      tournamentId,
      ...(filters.actorId ? { actorId: filters.actorId } : {}),
      ...(filters.action ? { action: filters.action } : {}),
      ...(filters.resourceType ? { resourceType: filters.resourceType } : {}),
      ...(filters.from || filters.to ? { createdAt: { gte: filters.from, lte: filters.to } } : {}),
    },
    include: { actor: { select: { displayName: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
    take: filters.take ?? 50,
  })
}

export async function listRecentActivityForTournament(tournamentId: string, take = 10) {
  return listActivityLogForTournament(tournamentId, { take })
}
