'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { updateDirectorNotesAction } from '@/features/adjudicators/actions/update-director-notes'

export function DirectorNotesForm({ adjudicatorId, initialNotes }: { adjudicatorId: string; initialNotes: string | null }) {
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  return (
    <form
      className="space-y-2 rounded-lg border p-4"
      onSubmit={async (e) => {
        e.preventDefault()
        setSaving(true); setError(null)
        const fd = new FormData(); fd.append('adjudicatorId', adjudicatorId); fd.append('directorNotes', notes)
        const r = await updateDirectorNotesAction(fd)
        setSaving(false)
        if (!r.ok) setError(r.error)
      }}
    >
      <Label>Director-only notes</Label>
      <textarea
        className="w-full rounded border p-2 text-sm"
        rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
      />
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving…' : 'Save notes'}</Button>
      </div>
    </form>
  )
}
