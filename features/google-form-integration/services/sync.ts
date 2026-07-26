import { prisma } from '@/lib/prisma'
import { getSheetsClient } from './sheets-client'
import { mapRowToSubmission } from './mapper'
import { ingestSource } from './ingest'
import type { SyncBatchResult, SyncSourceResult } from '../types'
import type { RegistrationPhase } from '@prisma/client'

function tabPrefix(tab: string | null): string {
  return tab ? `'${tab.replace(/'/g, "''")}'!` : ''
}

interface SourceLite {
  id: string
  tournamentId: string
  phase: RegistrationPhase
  spreadsheetId: string
  sheetTabName: string | null
  lastSyncedRow: number
  columnMapping: Record<string, string>
}

async function syncOneSource(source: SourceLite, fromRow = source.lastSyncedRow + 1): Promise<number> {
  const sheets = await getSheetsClient()
  const prefix = tabPrefix(source.sheetTabName)

  const headersRes = await sheets.spreadsheets.values.get({
    spreadsheetId: source.spreadsheetId,
    range: `${prefix}1:1`,
  })
  const headers = (headersRes.data.values?.[0] ?? []) as string[]

  const dataRes = await sheets.spreadsheets.values.get({
    spreadsheetId: source.spreadsheetId,
    range: `${prefix}A${fromRow}:ZZ`,
  })
  const rows = (dataRes.data.values ?? []) as string[][]

  let lastRow = source.lastSyncedRow
  for (let i = 0; i < rows.length; i++) {
    const rowIndex = fromRow + i
    const data = mapRowToSubmission(headers, rows[i], rowIndex, source.id)

    await prisma.googleFormSubmission.upsert({
      where: { sourceId_rowIndex: { sourceId: source.id, rowIndex } },
      create: {
        sourceId: data.sourceId,
        rowIndex: data.rowIndex,
        payload: data.payload as object,
      },
      update: { payload: data.payload as object },
    })
    lastRow = rowIndex
  }

  await prisma.tournamentSheetSource.update({
    where: { id: source.id },
    data: {
      lastSyncedRow: lastRow,
      lastSyncedAt: new Date(),
      lastSyncError: null,
    },
  })

  return rows.length
}

export async function syncAndIngestOneSource(sourceId: string): Promise<SyncSourceResult> {
  const row = await prisma.tournamentSheetSource.findUnique({
    where: { id: sourceId },
    select: {
      id: true,
      tournamentId: true,
      phase: true,
      spreadsheetId: true,
      sheetTabName: true,
      lastSyncedRow: true,
      columnMapping: true,
    },
  })
  if (!row || !row.columnMapping) {
    return { sourceId, synced: 0, error: 'Source not found or mapping not configured.' }
  }
  try {
    // Re-fetch ALL rows from row 2 so payload changes (new columns) are picked up on existing rows
    await syncOneSource(row as SourceLite, 2)

    // Reset processedAt for all submissions so ingest always reflects current sheet + mapping
    await prisma.googleFormSubmission.updateMany({
      where: { sourceId },
      data: { processedAt: null },
    })

    // Ingest and return the actual ingested count
    const ingested = await ingestSource(
      sourceId,
      row.tournamentId,
      row.phase as RegistrationPhase,
      row.columnMapping as Record<string, string>,
    )
    return { sourceId, synced: ingested, error: null }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    await prisma.tournamentSheetSource.update({
      where: { id: sourceId },
      data: { lastSyncError: message, lastSyncedAt: new Date() },
    }).catch(() => {})
    return { sourceId, synced: 0, error: message }
  }
}

export async function syncAllActiveSources(): Promise<SyncBatchResult> {
  const allActive = await prisma.tournamentSheetSource.findMany({
    where: { active: true },
    select: {
      id: true,
      tournamentId: true,
      phase: true,
      spreadsheetId: true,
      sheetTabName: true,
      lastSyncedRow: true,
      columnMapping: true,
    },
  })
  const sources = allActive.filter((s) => s.columnMapping !== null) as SourceLite[]

  const results: SyncSourceResult[] = []
  let totalSynced = 0

  for (const source of sources) {
    try {
      const synced = await syncOneSource(source)
      await ingestSource(source.id, source.tournamentId, source.phase, source.columnMapping)
      totalSynced += synced
      results.push({ sourceId: source.id, synced, error: null })
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      await prisma.tournamentSheetSource.update({
        where: { id: source.id },
        data: { lastSyncError: message, lastSyncedAt: new Date() },
      }).catch(() => {})
      results.push({ sourceId: source.id, synced: 0, error: message })
    }
  }

  return { sources: sources.length, totalSynced, results }
}
