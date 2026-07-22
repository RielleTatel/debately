import { prisma } from '@/lib/prisma'

export async function getRequestAnalytics(tournamentId: string) {
  const [byStatus, byType, resolved] = await Promise.all([
    prisma.request.groupBy({ by: ['status'], where: { tournamentId }, _count: true }),
    prisma.request.groupBy({ by: ['type'], where: { tournamentId }, _count: true }),
    prisma.request.findMany({ where: { tournamentId, resolvedAt: { not: null } }, select: { createdAt: true, resolvedAt: true, status: true } }),
  ])
  const ms = resolved.map((r) => r.resolvedAt!.getTime() - r.createdAt.getTime())
  const avgRes = ms.length === 0 ? 0 : ms.reduce((a, b) => a + b, 0) / ms.length
  return { byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r._count])), byType: Object.fromEntries(byType.map((r) => [r.type, r._count])), avgResolutionMs: avgRes, approvalRate: resolved.length === 0 ? 0 : resolved.filter((r) => r.status === 'APPROVED').length / resolved.length }
}
