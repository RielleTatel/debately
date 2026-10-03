export type SearchParams = Record<string, string | string[] | undefined>
export type PageInput = { page: number; pageSize: number; skip: number }

function positiveInteger(value: string | string[] | undefined, fallback: number, maximum: number) {
  const text = Array.isArray(value) ? value[0] : value
  if (!text || !/^\d+$/.test(text)) return fallback
  const number = Number(text)
  return Number.isSafeInteger(number) && number > 0 ? Math.min(number, maximum) : fallback
}

export function readPage(params: SearchParams = {}): PageInput {
  const page = positiveInteger(params.page, 1, 100_000)
  const pageSize = positiveInteger(params.pageSize, 50, 100)
  return { page, pageSize, skip: (page - 1) * pageSize }
}

export function pageRowCount(total: number, paging: PageInput): number {
  return Math.min(paging.pageSize, Math.max(0, total - paging.skip))
}
