'use server'

import { prisma } from '@/lib/prisma'
import { toApi } from '@/lib/errors'
import { csvService } from '@/services/csv'
import { tournamentImportsStorage } from '@/services/storage'
import { requireImportReadable } from '@/features/imports/permissions'
import type { ApiResponse } from '@/types/api'
import type { ParsedRow } from '@/features/imports/types'

type Payload = { csv: string; filename: string }

async function rowsCsvFor(importId: string, statuses: string[], suffix: string): Promise<ApiResponse<Payload>> {
  const rows = await prisma.csvImportRow.findMany({
    where: { importId, status: { in: statuses as never } },
    orderBy: { rowIndex: 'asc' },
  })
  const flat = rows.map((r) => {
    const parsed = r.rawJson as unknown as ParsedRow
    const raw = parsed?.raw ?? {}
    return {
      row_index: r.rowIndex,
      messages: r.messages.join(' | '),
      ...raw,
    }
  })
  return { ok: true, data: { csv: csvService.stringify(flat), filename: `import-${importId}-${suffix}.csv` } }
}

export async function downloadErrorRowsCsvAction(importId: string): Promise<ApiResponse<Payload>> {
  try {
    await requireImportReadable(importId)
    return rowsCsvFor(importId, ['ERROR'], 'errors')
  } catch (e) { return toApi(e) }
}

export async function downloadWarningRowsCsvAction(importId: string): Promise<ApiResponse<Payload>> {
  try {
    await requireImportReadable(importId)
    return rowsCsvFor(importId, ['WARNING'], 'warnings')
  } catch (e) { return toApi(e) }
}

export async function downloadOriginalCsvAction(importId: string): Promise<ApiResponse<{ url: string }>> {
  try {
    const { import: rec } = await requireImportReadable(importId)
    const url = await tournamentImportsStorage.signedUrl(rec.storagePath, 300)
    return { ok: true, data: { url } }
  } catch (e) { return toApi(e) }
}
