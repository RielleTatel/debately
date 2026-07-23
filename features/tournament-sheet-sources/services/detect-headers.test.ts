import { describe, it, expect, vi, beforeEach } from 'vitest'
import { detectSheetHeaders } from './detect-headers'
import { AppError } from '@/lib/errors'

const mockGet = vi.fn()

vi.mock('@/features/google-form-integration/services/sheets-client', () => ({
  getSheetsClient: () => ({
    spreadsheets: { values: { get: mockGet } },
  }),
}))

describe('detectSheetHeaders', () => {
  beforeEach(() => { mockGet.mockReset() })

  it('returns headers and row count from the first tab when no tab name given', async () => {
    mockGet
      .mockResolvedValueOnce({ data: { values: [['Timestamp', 'Team Name', 'Speakers']] } })
      .mockResolvedValueOnce({ data: { values: [['2026-01-01', 'Harvard A', 'Alice, Bob'], ['2026-01-02', 'MIT A', 'Carol']] } })

    const result = await detectSheetHeaders('sheet123')

    expect(result).toEqual({ headers: ['Timestamp', 'Team Name', 'Speakers'], sampleRowCount: 2 })
    expect(mockGet).toHaveBeenNthCalledWith(1, { spreadsheetId: 'sheet123', range: 'A1:Z1' })
  })

  it('uses the tab name when provided', async () => {
    mockGet
      .mockResolvedValueOnce({ data: { values: [['A', 'B']] } })
      .mockResolvedValueOnce({ data: { values: [] } })

    await detectSheetHeaders('sheet123', 'Form Responses 1')

    expect(mockGet).toHaveBeenNthCalledWith(1, { spreadsheetId: 'sheet123', range: "'Form Responses 1'!A1:Z1" })
  })

  it('throws FORBIDDEN when Sheets API returns 403', async () => {
    const err = Object.assign(new Error('The caller does not have permission'), { code: 403 })
    mockGet.mockRejectedValue(err)

    await expect(detectSheetHeaders('sheet123')).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('throws NOT_FOUND when Sheets API returns 404', async () => {
    const err = Object.assign(new Error('Requested entity was not found.'), { code: 404 })
    mockGet.mockRejectedValue(err)

    await expect(detectSheetHeaders('sheet123')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('throws VALIDATION_ERROR when headers row is empty', async () => {
    mockGet.mockResolvedValueOnce({ data: { values: [] } })

    await expect(detectSheetHeaders('sheet123')).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
  })
})
