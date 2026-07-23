export interface SheetResponseItem {
  question: string
  answer: string
}

export interface MappedSubmission {
  sourceId: string
  rowIndex: number
  payload: {
    responses: SheetResponseItem[]
    rawRow: string[]
  }
}

export interface SyncSourceResult {
  sourceId: string
  synced: number
  error: string | null
}

export interface SyncBatchResult {
  sources: number
  totalSynced: number
  results: SyncSourceResult[]
}
