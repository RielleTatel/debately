'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  downloadErrorRowsCsvAction,
  downloadWarningRowsCsvAction,
  downloadOriginalCsvAction,
  rollbackImportAction,
} from '@/features/imports/actions'
import type { ImportSummary } from '@/features/imports/types'

function triggerCsvDownload(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; document.body.appendChild(a)
  a.click(); a.remove(); URL.revokeObjectURL(url)
}

export function ImportSummaryPanel({
  importId, summary,
}: { importId: string; summary: ImportSummary }) {
  const [error, setError] = useState<string | null>(null)

  const download = async (kind: 'errors' | 'warnings' | 'original') => {
    setError(null)
    if (kind === 'original') {
      const r = await downloadOriginalCsvAction(importId)
      if (!r.ok) { setError(r.error); return }
      window.open(r.data.url, '_blank', 'noopener,noreferrer')
      return
    }
    const r = kind === 'errors'
      ? await downloadErrorRowsCsvAction(importId)
      : await downloadWarningRowsCsvAction(importId)
    if (!r.ok) { setError(r.error); return }
    triggerCsvDownload(r.data.csv, r.data.filename)
  }

  const rollback = async () => {
    if (!confirm('Roll back this import? Committed records will remain until removed manually.')) return
    const fd = new FormData(); fd.append('importId', importId); fd.append('confirm', 'true')
    const r = await rollbackImportAction(fd)
    if (!r.ok) setError(r.error)
  }

  const items: [string, number][] = [
    ['Rows total', summary.rowsTotal],
    ['Rows imported', summary.rowsImported],
    ['Rows with warnings', summary.rowsWithWarnings],
    ['Rows with errors', summary.rowsWithErrors],
    ['Institutions created', summary.institutionsCreated],
    ['Teams created', summary.teamsCreated],
    ['Participants created', summary.participantsCreated],
    ['Adjudicators created', summary.adjudicatorsCreated],
    ['Records updated via re-import', summary.recordsUpdatedViaReimport],
  ]

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-lg border p-3">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-lg font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => download('errors')} disabled={summary.rowsWithErrors === 0}>
          Download error rows
        </Button>
        <Button variant="outline" onClick={() => download('warnings')} disabled={summary.rowsWithWarnings === 0}>
          Download warning rows
        </Button>
        <Button variant="outline" onClick={() => download('original')}>Download original CSV</Button>
        <Button variant="ghost" onClick={rollback}>Roll back import</Button>
      </div>
    </div>
  )
}
