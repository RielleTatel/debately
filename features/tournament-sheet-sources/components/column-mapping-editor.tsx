'use client'
import { useEffect, useState, useTransition } from 'react'
import { testSourceAction, updateMappingAction } from '../actions'

const CANONICAL_FIELDS = ['institutionName', 'teamName', 'speakerName', 'adjudicatorName', 'email']

interface Props {
  sourceId: string
  spreadsheetId: string
  sheetTabName: string | null
  initial: Record<string, string>
  onClose: () => void
}

export function ColumnMappingEditor({ sourceId, spreadsheetId, sheetTabName, initial, onClose }: Props) {
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  useEffect(() => {
    (async () => {
      const fd = new FormData()
      fd.set('spreadsheetId', spreadsheetId)
      if (sheetTabName) fd.set('sheetTabName', sheetTabName)
      const r = await testSourceAction(fd)
      if (!r.ok) { setError(r.error); return }
      setHeaders(r.data.headers)
    })()
  }, [spreadsheetId, sheetTabName])

  function handleSave() {
    setError(null)
    const clean = Object.fromEntries(Object.entries(mapping).filter(([, v]) => v && v.trim()))
    if (Object.keys(clean).length === 0) { setError('Map at least one field.'); return }
    start(async () => {
      const fd = new FormData()
      fd.set('sourceId', sourceId)
      fd.set('columnMapping', JSON.stringify(clean))
      const r = await updateMappingAction(fd)
      if (!r.ok) { setError(r.error); return }
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg space-y-3 rounded bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Column mapping</h2>
        <p className="text-xs text-gray-500">Map each Debately field to a column in your sheet.</p>

        {CANONICAL_FIELDS.map((field) => (
          <label key={field} className="grid grid-cols-2 gap-2 text-sm">
            <span className="self-center">{field}</span>
            <select
              className="rounded border p-1"
              value={mapping[field] ?? ''}
              onChange={(e) => setMapping((m) => ({ ...m, [field]: e.target.value }))}
            >
              <option value="">— skip —</option>
              {headers.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </label>
        ))}

        {error && <div className="rounded bg-red-50 p-2 text-xs text-red-700">{error}</div>}

        <div className="flex justify-end gap-2">
          <button className="rounded px-3 py-1 text-sm" onClick={onClose}>Cancel</button>
          <button
            className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50"
            onClick={handleSave}
            disabled={pending}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
