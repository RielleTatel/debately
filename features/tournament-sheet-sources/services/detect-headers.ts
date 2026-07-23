import { AppError } from '@/lib/errors'
import { getSheetsClient } from '@/features/google-form-integration/services/sheets-client'
import type { DetectedHeaders } from '../types'

function tabPrefix(tab?: string | null): string {
  return tab ? `'${tab.replace(/'/g, "''")}'!` : ''
}

export async function detectSheetHeaders(
  spreadsheetId: string,
  sheetTabName?: string | null,
): Promise<DetectedHeaders> {
  const sheets = await getSheetsClient()
  const prefix = tabPrefix(sheetTabName)

  try {
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${prefix}A1:Z1`,
    })
    const headers = (headerRes.data.values?.[0] ?? []) as string[]
    if (headers.length === 0) {
      throw new AppError('VALIDATION_ERROR', 'Sheet has no header row (row 1 is empty).', 400)
    }

    const sampleRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${prefix}A2:A`,
    })
    const sampleRowCount = sampleRes.data.values?.length ?? 0

    return { headers, sampleRowCount }
  } catch (e: unknown) {
    if (e instanceof AppError) throw e
    const code = (e as { code?: number }).code
    const message = e instanceof Error ? e.message : String(e)
    if (code === 403) throw new AppError('FORBIDDEN', `Service account cannot access sheet: ${message}`, 403)
    if (code === 404) throw new AppError('NOT_FOUND', 'Spreadsheet or tab not found.', 404)
    throw new AppError('INTERNAL_ERROR', `Sheets API error: ${message}`, 500)
  }
}
