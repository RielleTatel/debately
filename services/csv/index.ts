type CsvRow = Record<string, string | number | boolean | null>

export const csvService = {
  stringify(rows: CsvRow[]): string {
    if (rows.length === 0) return ''
    const headers = Object.keys(rows[0])
    const lines = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const val = String(row[h] ?? '')
            return val.includes(',') ? `"${val.replace(/"/g, '""')}"` : val
          })
          .join(',')
      ),
    ]
    return lines.join('\n')
  },

  parse(csv: string): CsvRow[] {
    const lines = csv.trim().split('\n')
    if (lines.length < 2) return []
    const headers = lines[0].split(',')
    return lines.slice(1).map((line) => {
      const values = line.split(',')
      return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
    })
  },
}
