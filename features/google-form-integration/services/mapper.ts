import type { MappedSubmission } from '../types'

export function mapRowToSubmission(
  headers: string[],
  row: string[],
  rowIndex: number,
  sourceId: string,
): MappedSubmission {
  const responses = headers.map((question, i) => ({
    question,
    answer: row[i] ?? '',
  }))

  return {
    sourceId,
    rowIndex,
    payload: {
      responses,
      rawRow: row,
    },
  }
}
