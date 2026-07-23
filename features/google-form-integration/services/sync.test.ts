import { describe, it, expect, vi, beforeEach } from 'vitest'
import { syncAllActiveSources } from './sync'

const mockGet = vi.fn()
const mockFindMany = vi.fn()
const mockUpsert = vi.fn()
const mockUpdate = vi.fn()

vi.mock('./sheets-client', () => ({
  getSheetsClient: () => ({
    spreadsheets: { values: { get: mockGet } },
  }),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    tournamentSheetSource: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
    googleFormSubmission: {
      upsert: (...args: unknown[]) => mockUpsert(...args),
    },
  },
}))

describe('syncAllActiveSources', () => {
  beforeEach(() => {
    mockGet.mockReset()
    mockFindMany.mockReset()
    mockUpsert.mockReset()
    mockUpdate.mockReset()
  })

  it('returns empty result when no active mapped sources exist', async () => {
    mockFindMany.mockResolvedValueOnce([])

    const result = await syncAllActiveSources()

    expect(result).toEqual({ sources: 0, totalSynced: 0, results: [] })
    expect(mockGet).not.toHaveBeenCalled()
  })

  it('syncs new rows for one source and advances cursor', async () => {
    mockFindMany.mockResolvedValueOnce([{
      id: 'src1', spreadsheetId: 'sheet1', sheetTabName: null, lastSyncedRow: 1,
      columnMapping: { teamName: 'Team Name' },
    }])
    mockGet
      .mockResolvedValueOnce({ data: { values: [['Timestamp', 'Team Name']] } })
      .mockResolvedValueOnce({ data: { values: [['2026-01-01', 'Harvard A'], ['2026-01-02', 'MIT A']] } })
    mockUpsert.mockResolvedValue({})
    mockUpdate.mockResolvedValue({})

    const result = await syncAllActiveSources()

    expect(result.sources).toBe(1)
    expect(result.totalSynced).toBe(2)
    expect(result.results[0]).toEqual({ sourceId: 'src1', synced: 2, error: null })
    expect(mockUpsert).toHaveBeenCalledTimes(2)
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'src1' },
      data: expect.objectContaining({ lastSyncedRow: 3, lastSyncError: null }),
    }))
  })

  it('records per-source error but continues to next source', async () => {
    mockFindMany.mockResolvedValueOnce([
      { id: 'src1', spreadsheetId: 'sheet1', sheetTabName: null, lastSyncedRow: 1, columnMapping: {} },
      { id: 'src2', spreadsheetId: 'sheet2', sheetTabName: null, lastSyncedRow: 1, columnMapping: {} },
    ])
    mockGet
      .mockResolvedValueOnce({ data: { values: [['A']] } })
      .mockRejectedValueOnce(new Error('API quota exceeded'))
      .mockResolvedValueOnce({ data: { values: [['B']] } })
      .mockResolvedValueOnce({ data: { values: [] } })
    mockUpdate.mockResolvedValue({})

    const result = await syncAllActiveSources()

    expect(result.sources).toBe(2)
    expect(result.results[0].error).toContain('quota exceeded')
    expect(result.results[1].error).toBeNull()
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'src1' },
      data: expect.objectContaining({ lastSyncError: expect.stringContaining('quota') }),
    }))
  })

  it('returns 0 synced when there are no new rows', async () => {
    mockFindMany.mockResolvedValueOnce([{
      id: 'src1', spreadsheetId: 'sheet1', sheetTabName: null, lastSyncedRow: 5,
      columnMapping: {},
    }])
    mockGet
      .mockResolvedValueOnce({ data: { values: [['A']] } })
      .mockResolvedValueOnce({ data: { values: [] } })
    mockUpdate.mockResolvedValue({})

    const result = await syncAllActiveSources()

    expect(result.totalSynced).toBe(0)
    expect(result.results[0].synced).toBe(0)
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ lastSyncedRow: 5 }),
    }))
  })
})
