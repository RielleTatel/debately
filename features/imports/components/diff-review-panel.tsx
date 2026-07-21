'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { applyDiffAction } from '@/features/imports/actions'
import type { TeamDiff } from '@/features/imports/types'

export function DiffReviewPanel({
  importId, rowIndex, diff,
}: { importId: string; rowIndex: number; diff: TeamDiff }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(diff.fields.filter((f) => f.changed).map((f) => f.name)))
  const [state, setState] = useState<'idle' | 'applied' | 'kept'>('idle')
  const [error, setError] = useState<string | null>(null)

  const toggle = (name: string) => {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(name)) next.delete(name); else next.add(name)
      return next
    })
  }

  const decide = async (mode: 'apply' | 'apply-selected' | 'keep-existing') => {
    setError(null)
    const fd = new FormData()
    fd.append('importId', importId); fd.append('rowIndex', String(rowIndex)); fd.append('mode', mode)
    fd.append('selectedFields', JSON.stringify(mode === 'apply-selected' ? [...selected] : []))
    const r = await applyDiffAction(fd)
    if (!r.ok) { setError(r.error); return }
    setState(mode === 'keep-existing' ? 'kept' : 'applied')
  }

  if (state !== 'idle') {
    return <div className="rounded-lg border p-3 text-sm">Team &ldquo;{diff.teamName}&rdquo; — {state === 'applied' ? 'Update queued' : 'Kept existing record'}.</div>
  }

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <p className="text-sm">
        <strong>{diff.teamName}</strong> — {diff.institutionName}
      </p>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left">
            <th className="w-6"></th>
            <th>Field</th>
            <th>Existing</th>
            <th>Incoming</th>
          </tr>
        </thead>
        <tbody>
          {diff.fields.map((f) => (
            <tr key={f.name} className={f.changed ? '' : 'text-muted-foreground'}>
              <td>
                {f.changed && (
                  <input
                    type="checkbox"
                    aria-label={`Select ${f.name}`}
                    checked={selected.has(f.name)}
                    onChange={() => toggle(f.name)}
                  />
                )}
              </td>
              <td>{f.name}</td>
              <td>{f.existing ?? '—'}</td>
              <td>{f.incoming ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => decide('apply')}>Apply incoming</Button>
        <Button size="sm" variant="outline" onClick={() => decide('apply-selected')} disabled={selected.size === 0}>
          Apply selected fields ({selected.size})
        </Button>
        <Button size="sm" variant="ghost" onClick={() => decide('keep-existing')}>Keep existing</Button>
      </div>
    </div>
  )
}
