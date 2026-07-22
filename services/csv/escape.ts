export function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString()
  const s = String(value)
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function csvRow(values: unknown[]): string {
  return values.map(csvEscape).join(',') + '\r\n'
}
