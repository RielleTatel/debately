import { prisma } from '@/lib/prisma'

export async function getImportAnalytics(tournamentId: string) {
  const [total, byStatus, rowsAgg] = await Promise.all([
    prisma.csvImport.count({ where: { tournamentId } }),
    prisma.csvImport.groupBy({ by: ['status'], where: { tournamentId }, _count: true }),
    prisma.csvImportRow.groupBy({ by: ['status'], where: { import: { tournamentId } }, _count: true }),
  ])
  const errors = rowsAgg.find((r) => r.status === 'ERROR')?._count ?? 0
  const totalRows = rowsAgg.reduce((a, r) => a + r._count, 0)
  return { totalImports: total, byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r._count])), rowErrorRate: totalRows === 0 ? 0 : errors / totalRows }
}
