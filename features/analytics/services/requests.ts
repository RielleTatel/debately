import { cache } from 'react'
import { prisma } from '@/lib/prisma'

export const getRequestAnalytics = cache(async (tournamentId: string) => {
  const [byStatus, byType, averages] = await Promise.all([
    prisma.request.groupBy({ by: ['status'], where: { tournamentId }, _count: true }),
    prisma.request.groupBy({ by: ['type'], where: { tournamentId }, _count: true }),
    prisma.$queryRaw<Array<{ avgResolutionMs: number; approvalRate: number }>>`
      SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at-created_at))*1000),0)::double precision AS "avgResolutionMs",
        COALESCE(AVG(CASE WHEN status='APPROVED' THEN 1.0 ELSE 0.0 END),0)::double precision AS "approvalRate"
      FROM requests WHERE tournament_id=${tournamentId} AND resolved_at IS NOT NULL
    `,
  ])
  return {
    byStatus: Object.fromEntries(byStatus.map((row) => [row.status, row._count])),
    byType: Object.fromEntries(byType.map((row) => [row.type, row._count])),
    avgResolutionMs: averages[0]?.avgResolutionMs ?? 0,
    approvalRate: averages[0]?.approvalRate ?? 0,
  }
})
