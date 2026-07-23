'use server'
import { AppError, toApi } from '@/lib/errors'
import { testSourceSchema } from '../schemas'
import { detectSheetHeaders } from '../services/detect-headers'
import type { ApiResponse } from '@/types/api'
import type { DetectedHeaders } from '../types'

export async function testSourceAction(fd: FormData): Promise<ApiResponse<DetectedHeaders>> {
  try {
    const parsed = testSourceSchema.safeParse({
      spreadsheetId: fd.get('spreadsheetId'),
      sheetTabName: fd.get('sheetTabName') ? String(fd.get('sheetTabName')) : null,
    })
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', parsed.error.issues[0].message)

    const result = await detectSheetHeaders(parsed.data.spreadsheetId, parsed.data.sheetTabName)
    return { ok: true, data: result }
  } catch (e) {
    return toApi(e)
  }
}
