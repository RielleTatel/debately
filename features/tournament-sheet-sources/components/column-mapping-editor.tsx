'use client'
import { useEffect, useState, useTransition } from 'react'
import { testSourceAction, updateMappingAction } from '../actions'
import type { RegistrationPhase } from '../types'

const FIELDS_BY_PHASE: Record<RegistrationPhase, { key: string; label: string }[]> = {
  INSTITUTIONS: [
    { key: 'registrationType',    label: 'Registration Type' },
    { key: 'institutionName',     label: 'Institution Name' },
    { key: 'representativeName',  label: 'Representative Name' },
    { key: 'email',               label: 'Email' },
    { key: 'contactNumber',       label: 'Contact Number' },
    { key: 'numberOfTeams',       label: 'Number of Teams' },
    { key: 'numberOfAdjudicators', label: 'Number of Adjudicators' },
    { key: 'facebookUrl',         label: 'Facebook URL' },
  ],
  TEAMS: [
    { key: 'registrationType',    label: 'Registration Type' },
    { key: 'institutionName',     label: 'Institution Name' },
    { key: 'representativeName',  label: 'Representative Name' },
    { key: 'teamName',            label: 'Team Name' },
    { key: 'teamIsNovice',        label: 'Team Is Novice?' },
    { key: 'speaker1Name',        label: 'Debater 1 Name' },
    { key: 'speaker1Email',       label: 'Debater 1 Email' },
    { key: 'speaker1Contact',     label: 'Debater 1 Contact' },
    { key: 'speaker1Facebook',    label: 'Debater 1 Facebook' },
    { key: 'speaker1IsNovice',    label: 'Debater 1 Is Novice?' },
    { key: 'speaker2Name',        label: 'Debater 2 Name' },
    { key: 'speaker2Email',       label: 'Debater 2 Email' },
    { key: 'speaker2Contact',     label: 'Debater 2 Contact' },
    { key: 'speaker2Facebook',    label: 'Debater 2 Facebook' },
    { key: 'speaker2IsNovice',    label: 'Debater 2 Is Novice?' },
    { key: 'speaker3Name',        label: 'Debater 3 Name' },
    { key: 'speaker3Email',       label: 'Debater 3 Email' },
    { key: 'speaker3Contact',     label: 'Debater 3 Contact' },
    { key: 'speaker3Facebook',    label: 'Debater 3 Facebook' },
    { key: 'speaker3IsNovice',    label: 'Debater 3 Is Novice?' },
    { key: 'adjudicatorName',     label: 'Judge Name' },
    { key: 'adjudicatorInstitution', label: 'Judge Institution' },
    { key: 'adjudicatorEmail',    label: 'Judge Email' },
    { key: 'adjudicatorContact',  label: 'Judge Contact' },
    { key: 'adjudicatorFacebook', label: 'Judge Facebook' },
  ],
  ADJUDICATORS: [
    { key: 'registrationType',    label: 'Registration Type' },
    { key: 'institutionName',     label: 'Institution Name (optional)' },
    { key: 'adjudicatorName',     label: 'Judge Name' },
    { key: 'adjudicatorEmail',    label: 'Judge Email' },
    { key: 'adjudicatorContact',  label: 'Judge Contact' },
    { key: 'adjudicatorFacebook', label: 'Judge Facebook' },
  ],
}

interface Props {
  sourceId: string
  spreadsheetId: string
  sheetTabName: string | null
  phase: RegistrationPhase
  initial: Record<string, string>
  onClose: () => void
}

export function ColumnMappingEditor({ sourceId, spreadsheetId, sheetTabName, phase, initial, onClose }: Props) {
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

  const fields = FIELDS_BY_PHASE[phase]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded bg-white p-6 shadow-xl flex flex-col max-h-[85vh]">
        <h2 className="text-lg font-semibold mb-1">Column mapping</h2>
        <p className="text-xs text-gray-500 mb-3">Map each Debately field to a column in your sheet.</p>

        <div className="overflow-y-auto flex-1 space-y-3 pr-1">
          {fields.map(({ key, label }) => (
            <label key={key} className="grid grid-cols-2 gap-2 text-sm">
              <span className="self-center">{label}</span>
              <select
                className="rounded border p-1"
                value={mapping[key] ?? ''}
                onChange={(e) => setMapping((m) => ({ ...m, [key]: e.target.value }))}
              >
                <option value="">— skip —</option>
                {headers.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </label>
          ))}
        </div>

        {error && <div className="rounded bg-red-50 p-2 text-xs text-red-700 mt-3">{error}</div>}

        <div className="flex justify-end gap-2 mt-4">
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
