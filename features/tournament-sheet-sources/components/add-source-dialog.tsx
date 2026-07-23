'use client'
import { useState, useTransition } from 'react'
import { createSourceAction, testSourceAction } from '../actions'
import { REGISTRATION_PHASES, PHASE_LABELS } from '../types'

interface Props { tournamentId: string }

export function AddSourceDialog({ tournamentId }: Props) {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState(REGISTRATION_PHASES[0])
  const [spreadsheetId, setSpreadsheetId] = useState('')
  const [sheetTabName, setSheetTabName] = useState('')
  const [testResult, setTestResult] = useState<{ headers: string[]; sampleRowCount: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function reset() {
    setPhase(REGISTRATION_PHASES[0])
    setSpreadsheetId('')
    setSheetTabName('')
    setTestResult(null)
    setError(null)
  }

  async function handleTest() {
    setError(null)
    setTestResult(null)
    const fd = new FormData()
    fd.set('spreadsheetId', spreadsheetId)
    if (sheetTabName) fd.set('sheetTabName', sheetTabName)
    const r = await testSourceAction(fd)
    if (!r.ok) { setError(r.error); return }
    setTestResult(r.data)
  }

  function handleCreate() {
    setError(null)
    start(async () => {
      const fd = new FormData()
      fd.set('tournamentId', tournamentId)
      fd.set('phase', phase)
      fd.set('spreadsheetId', spreadsheetId)
      if (sheetTabName) fd.set('sheetTabName', sheetTabName)
      const r = await createSourceAction(fd)
      if (!r.ok) { setError(r.error); return }
      setOpen(false)
      reset()
    })
  }

  if (!open) {
    return (
      <button
        className="rounded bg-black px-3 py-1.5 text-sm text-white"
        onClick={() => setOpen(true)}
      >
        Add source
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md space-y-3 rounded bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Add sheet source</h2>

        <label className="block text-sm">
          Phase
          <select
            className="mt-1 block w-full rounded border p-2"
            value={phase}
            onChange={(e) => setPhase(e.target.value as typeof phase)}
          >
            {REGISTRATION_PHASES.map((p) => (
              <option key={p} value={p}>{PHASE_LABELS[p]}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Spreadsheet ID
          <span className="ml-1 text-xs text-gray-400">(from the Google Sheets URL)</span>
          <input
            className="mt-1 block w-full rounded border p-2 font-mono text-xs"
            value={spreadsheetId}
            onChange={(e) => { setSpreadsheetId(e.target.value); setTestResult(null) }}
            placeholder="1BxiMVs0XRA5nFMdKvBd…"
          />
        </label>

        <label className="block text-sm">
          Tab name
          <span className="ml-1 text-xs text-gray-400">(optional — blank = first tab)</span>
          <input
            className="mt-1 block w-full rounded border p-2"
            value={sheetTabName}
            onChange={(e) => { setSheetTabName(e.target.value); setTestResult(null) }}
            placeholder="Form Responses 1"
          />
        </label>

        <button
          className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          onClick={handleTest}
          disabled={!spreadsheetId || pending}
        >
          Test connection
        </button>

        {testResult && (
          <div className="rounded bg-green-50 p-2 text-xs">
            <div className="font-medium text-green-800">
              Connected — {testResult.headers.length} columns, {testResult.sampleRowCount} existing rows
            </div>
            <div className="mt-1 text-green-700 truncate">
              Headers: {testResult.headers.join(', ')}
            </div>
          </div>
        )}

        {error && <div className="rounded bg-red-50 p-2 text-xs text-red-700">{error}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            className="rounded px-3 py-1 text-sm"
            onClick={() => { setOpen(false); reset() }}
          >
            Cancel
          </button>
          <button
            className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50"
            onClick={handleCreate}
            disabled={!testResult || pending}
          >
            {pending ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
