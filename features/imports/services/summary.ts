import { prisma } from '@/lib/prisma'
import type { ImportSummary } from '@/features/imports/types'

export async function buildImportSummary(importId: string): Promise<ImportSummary> {
  const counts = await prisma.csvImportRow.groupBy({
    by: ['status'],
    where: { importId },
    _count: true,
  })
  const count = (status: string) => counts.find((row) => row.status === status)?._count ?? 0
  return {
    rowsTotal: counts.reduce((total, row) => total + row._count, 0),
    rowsImported: count('IMPORTED'),
    rowsWithErrors: count('ERROR'),
    rowsWithWarnings: count('WARNING'),
    rowsSkipped: count('SKIPPED'),
    institutionsCreated: 0,
    teamsCreated: 0,
    participantsCreated: 0,
    adjudicatorsCreated: 0,
    recordsUpdatedViaReimport: 0,
    aliasesApplied: 0,
  }
}
