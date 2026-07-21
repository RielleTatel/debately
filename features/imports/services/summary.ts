import { prisma } from '@/lib/prisma'
import type { ImportSummary } from '@/features/imports/types'

export async function buildImportSummary(importId: string): Promise<ImportSummary> {
  const rows = await prisma.csvImportRow.findMany({ where: { importId } })
  return {
    rowsTotal: rows.length,
    rowsImported: rows.filter((r) => r.status === 'IMPORTED').length,
    rowsWithErrors: rows.filter((r) => r.status === 'ERROR').length,
    rowsWithWarnings: rows.filter((r) => r.status === 'WARNING').length,
    rowsSkipped: rows.filter((r) => r.status === 'SKIPPED').length,
    institutionsCreated: 0, teamsCreated: 0, participantsCreated: 0,
    adjudicatorsCreated: 0, recordsUpdatedViaReimport: 0, aliasesApplied: 0,
  }
}
