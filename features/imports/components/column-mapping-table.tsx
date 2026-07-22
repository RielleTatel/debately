'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RepeatingGroupControls, type RepeatGroupState } from './repeating-group-controls'
import { MappingTemplatePicker } from './mapping-template-picker'
import {
  saveMappingAction, processImportAction, saveMappingTemplateAction,
} from '@/features/imports/actions'
import { autoMapHeaders } from '@/features/imports/services/auto-mapper'
import { ROUTES } from '@/lib/constants'
import type { ColumnMapping } from '@prisma/client'
import type { SystemField, MappingSpec, ColumnMappingEntry } from '@/features/imports/types'

const SYSTEM_FIELDS: { value: SystemField; label: string }[] = [
  { value: 'ignore', label: 'Ignore' },
  { value: 'registration_type', label: 'Registration type' },
  { value: 'institution_name', label: 'Institution name' },
  { value: 'representative_name', label: 'Rep name' },
  { value: 'representative_email', label: 'Rep email' },
  { value: 'representative_contact', label: 'Rep contact' },
  { value: 'teams_intended', label: 'Teams intended (Phase 1)' },
  { value: 'adjudicators_intended', label: 'Adj intended (Phase 1)' },
  { value: 'team_name', label: 'Team name' },
  { value: 'team_novice', label: 'Team novice?' },
  { value: 'debater_name', label: 'Debater name' },
  { value: 'debater_email', label: 'Debater email' },
  { value: 'debater_contact', label: 'Debater contact' },
  { value: 'debater_institution', label: 'Debater institution' },
  { value: 'judge_name', label: 'Judge name' },
  { value: 'judge_email', label: 'Judge email' },
  { value: 'judge_contact', label: 'Judge contact' },
  { value: 'judge_institution', label: 'Judge institution' },
]

export function ColumnMappingTable({
  tournamentId, importId, headers, initialMapping, templates, orgId,
}: {
  tournamentId: string
  importId: string
  headers: string[]
  initialMapping: MappingSpec | null
  templates: ColumnMapping[]
  orgId: string
}) {
  const router = useRouter()
  const [entries, setEntries] = useState<ColumnMappingEntry[]>(
    initialMapping?.entries ?? autoMapHeaders(headers),
  )
  const [groups, setGroups] = useState<RepeatGroupState[]>(initialMapping?.repeatGroups ?? [])
  const [templateName, setTemplateName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mapping = useMemo<MappingSpec>(() => ({ entries, repeatGroups: groups }), [entries, groups])

  const updateEntry = (idx: number, patch: Partial<ColumnMappingEntry>) => {
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, ...patch } : e)))
  }

  const applyTemplate = (t: ColumnMapping) => {
    const spec = t.mappingJson as unknown as MappingSpec
    const byHeader = new Map(spec.entries.map((e) => [e.header.toLowerCase(), e]))
    setEntries(entries.map((e) => byHeader.get(e.header.toLowerCase()) ?? e))
    setGroups(spec.repeatGroups)
  }

  const persist = async (): Promise<boolean> => {
    setError(null)
    const fd = new FormData()
    fd.append('importId', importId)
    fd.append('mapping', JSON.stringify(mapping))
    const r = await saveMappingAction(fd)
    if (!r.ok) { setError(r.error); return false }
    return true
  }

  const saveAndProcess = async () => {
    setSaving(true)
    const ok = await persist()
    if (!ok) { setSaving(false); return }
    const p = await processImportAction(importId)
    setSaving(false)
    if (!p.ok) { setError(p.error); return }
    router.push(`${ROUTES.imports(tournamentId)}/${importId}/review`)
  }

  const saveTemplate = async () => {
    if (!templateName.trim()) { setError('Template name is required'); return }
    const fd = new FormData()
    fd.append('orgId', orgId); fd.append('name', templateName)
    fd.append('mapping', JSON.stringify(mapping))
    const r = await saveMappingTemplateAction(fd)
    if (!r.ok) setError(r.error)
  }

  const missingCritical = (['registration_type', 'institution_name'] as SystemField[]).filter(
    (f) => !entries.some((e) => e.field === f),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
        <p className="text-sm text-muted-foreground">
          Guess mappings from column names, then adjust as needed.
        </p>
        <Button type="button" variant="outline" onClick={() => setEntries(autoMapHeaders(headers))}>
          Auto-map columns
        </Button>
      </div>

      {missingCritical.length > 0 && (
        <div role="alert" className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Missing required fields: <strong>{missingCritical.join(', ')}</strong>. Rows will fail on
          processing unless every row is an independent adjudicator.
        </div>
      )}

      <MappingTemplatePicker templates={templates} onApply={applyTemplate} />
      <RepeatingGroupControls groups={groups} onChange={setGroups} />

      <table className="w-full border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-muted-foreground">
            <th>CSV column</th>
            <th>System field</th>
            <th>Slot #</th>
            <th>Repeat group</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={idx} className="rounded-md border">
              <td className="p-2 font-medium">{entry.header}</td>
              <td className="p-2">
                <select
                  className="rounded border p-1"
                  value={entry.field}
                  aria-label={`System field for ${entry.header}`}
                  onChange={(e) => updateEntry(idx, { field: e.target.value as SystemField })}
                >
                  {SYSTEM_FIELDS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </td>
              <td className="p-2">
                <Input
                  type="number" min={1} max={20}
                  value={entry.slotIndex ?? ''}
                  onChange={(e) => updateEntry(idx, { slotIndex: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-16"
                  aria-label={`Slot for ${entry.header}`}
                />
              </td>
              <td className="p-2">
                <select
                  className="rounded border p-1"
                  value={entry.repeatGroup ?? ''}
                  onChange={(e) => updateEntry(idx, { repeatGroup: e.target.value || undefined })}
                  aria-label={`Repeat group for ${entry.header}`}
                >
                  <option value="">—</option>
                  {groups.map((g) => <option key={g.name} value={g.name}>{g.name}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="tplName">Save as template</Label>
          <Input id="tplName" value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Optional" />
        </div>
        <Button variant="outline" onClick={saveTemplate}>Save template</Button>
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={persist} disabled={saving}>Save draft</Button>
        <Button onClick={saveAndProcess} disabled={saving}>
          {saving ? 'Processing…' : 'Save + process rows'}
        </Button>
      </div>
    </div>
  )
}
