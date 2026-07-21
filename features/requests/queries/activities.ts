import { prisma } from '@/lib/prisma'
export async function listActivitiesForRequest(requestId: string) {
  return prisma.requestActivity.findMany({ where: { requestId }, include: { actor: { select: { displayName: true, avatarUrl: true } } }, orderBy: { createdAt: 'asc' } })
}
