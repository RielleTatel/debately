'use server'

import { prisma } from '@/lib/prisma'
import { toApi, Errors } from '@/lib/errors'
import { logger } from '@/services/logger'
import { tournamentImportsStorage } from '@/services/storage'
import { requireImportEditor } from '@/features/imports/permissions'
import { parseCsvRows } from '@/features/imports/services/csv-parser'
import { applyMapping } from '@/features/imports/services/process-row'
import { validateRow } from '@/features/imports/services/validate-row'
import type { MappingSpec, ParsedRow } from '@/features/imports/types'
import type { ApiResponse } from '@/types/api'

type ProcessSummary = {
  rowsTotal: number
  rowsWithErrors: number
  rowsWithWarnings: number
  rowsPending: number
}

function inferPhase(label: string): 'phase-1' | 'phase-2' | 'phase-3' {
  const s = label.toLowerCase()
  if (s.includes('phase 1') || s.includes('intent')) return 'phase-1'
  if (s.includes('phase 3') || s.includes('correction')) return 'phase-3'
  return 'phase-2'
}

export async function processImportAction(importId: string): Promise<ApiResponse<ProcessSummary>> {
  try {
    const { import: rec, tournamentId } = await requireImportEditor(importId)
    if (!rec.mappingJson) throw Errors.conflict('Mapping not saved yet')
    const mapping = rec.mappingJson as unknown as MappingSpec
    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } })
    if (!tournament) throw Errors.notFound('Tournament not found')
    const speakerCount = ((tournament.formatConfig as { speakerCount?: number } | null)?.speakerCount) ?? 3
    const phase = inferPhase(rec.phaseLabel)

    const csvText = await tournamentImportsStorage.readText(rec.storagePath)
    const { rows } = parseCsvRows(csvText)

    let errors = 0, warns = 0
    const seed: Array<{
      importId: string; rowIndex: number; rawJson: unknown; status: string; messages: string[]
    }> = []
    for (let i = 0; i < rows.length; i++) {
      const parsed: ParsedRow = applyMapping(rows[i], mapping, i)
      const issues = validateRow(parsed, phase, speakerCount)
      const hasError = issues.some((x) => x.kind === 'error')
      const hasWarn = issues.some((x) => x.kind === 'warning')
      const status = hasError ? 'ERROR' : hasWarn ? 'WARNING' : 'PENDING'
      if (hasError) errors++
      if (hasWarn && !hasError) warns++
      seed.push({
        importId: rec.id,
        rowIndex: i,
        rawJson: parsed as unknown,
        status,
        messages: issues.map((x) => `[${x.kind}] ${x.field}: ${x.message}`),
      })
    }

    await prisma.csvImportRow.deleteMany({ where: { importId: rec.id } })
    await prisma.csvImportRow.createMany({ data: seed as never })
    await prisma.csvImport.update({
      where: { id: rec.id },
      data: {
        status: 'PROCESSED',
        summaryJson: { rowsTotal: rows.length, errors, warns } as never,
      },
    })

    logger.info('CSV import processed', { importId: rec.id, rowsTotal: rows.length })
    return {
      ok: true,
      data: {
        rowsTotal: rows.length,
        rowsWithErrors: errors,
        rowsWithWarnings: warns,
        rowsPending: rows.length - errors - warns,
      },
    }
  } catch (e) {
    return toApi(e)
  }
}
