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

async function syncOneSource(source: SourceLite): Promise<number> {
  const sheets = await getSheetsClient()
  const prefix = tabPrefix(source.sheetTabName)

  const headersRes = await sheets.spreadsheets.values.get({
    spreadsheetId: source.spreadsheetId,
    range: `${prefix}A1:Z1`,
  })
  const headers = (headersRes.data.values?.[0] ?? []) as string[]

  const startRow = source.lastSyncedRow + 1
  const dataRes = await sheets.spreadsheets.values.get({
    spreadsheetId: source.spreadsheetId,
    range: `${prefix}A${startRow}:Z`,
  })
  const rows = (dataRes.data.values ?? []) as string[][]

  let lastRow = source.lastSyncedRow
  for (let i = 0; i < rows.length; i++) {
    const rowIndex = startRow + i
    const data = mapRowToSubmission(headers, rows[i], rowIndex, source.id)

    await prisma.googleFormSubmission.upsert({
      where: { sourceId_rowIndex: { sourceId: source.id, rowIndex } },
      create: {
        sourceId: data.sourceId,
        rowIndex: data.rowIndex,
        payload: data.payload as object,
      },
      update: {},
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

  await ingestSource(source.id, source.tournamentId, source.phase, source.columnMapping)

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
    const synced = await syncOneSource(row as SourceLite)
    return { sourceId, synced, error: null }
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
