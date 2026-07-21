import Papa from 'papaparse'

function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s
}

export function parseCsvHeaders(text: string): string[] {
  const clean = stripBom(text).trim()
  if (!clean) return []
  const firstLine = clean.split(/\r?\n/, 1)[0]
  const parsed = Papa.parse<string[]>(firstLine, { skipEmptyLines: true })
  return (parsed.data[0] ?? []).map((h) => h.trim())
}

export function parseCsvRows(text: string): {
  headers: string[]
  rows: Record<string, string>[]
} {
  const clean = stripBom(text)
  if (!clean.trim()) return { headers: [], rows: [] }
  const parsed = Papa.parse<Record<string, string>>(clean, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })
  const headers = parsed.meta.fields?.map((h) => h.trim()) ?? []
  const rows = (parsed.data ?? []).map((row) => {
    const out: Record<string, string> = {}
    for (const k of headers) out[k] = String(row[k] ?? '').trim()
    return out
  })
  return { headers, rows }
}
