import type { SyncBatchResult } from '../types'

export async function syncAllActiveSources(): Promise<SyncBatchResult> {
  return { sources: 0, totalSynced: 0, results: [] }
}
