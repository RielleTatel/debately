export type SubmissionPayload = {
  responses: { question: string; answer: string }[]
}

export function pick(
  payload: SubmissionPayload,
  mapping: Record<string, string>,
  field: string,
): string | null {
  const header = mapping[field]
  if (!header) return null
  const matches = payload.responses.filter((x) => x.question === header)
  // Prefer first non-empty answer (handles duplicate column names in sheet)
  const r = matches.find((x) => x.answer?.trim()) ?? matches[0]
  return r?.answer?.trim() || null
}

export function toInt(v: string | null): number | null {
  if (!v) return null
  const n = parseInt(v, 10)
  return isFinite(n) ? n : null
}

export function toBool(v: string | null): boolean {
  if (!v) return false
  return ['yes', 'true', '1'].includes(v.toLowerCase())
}

export function toMinor(v: string | null): number | null {
  if (!v) return null
  const n = parseFloat(v.replace(/,/g, ''))
  return isFinite(n) ? Math.round(n * 100) : null
}
