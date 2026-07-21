'use client'
import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  createScheduleEntryAction,
  updateScheduleEntryAction,
  deleteScheduleEntryAction,
} from '@/features/tournaments/actions'
import type { TournamentScheduleEntry, ScheduleEntryKind } from '@prisma/client'

function iso(d: Date | null | undefined) { return d ? new Date(d).toISOString().slice(0, 16) : '' }
const KINDS: ScheduleEntryKind[] = ['DEADLINE', 'ROUND', 'CEREMONY', 'BREAK', 'OTHER']

export function TournamentSchedulePanel({
  tournamentId, entries, readOnly,
}: { tournamentId: string; entries: TournamentScheduleEntry[]; readOnly: boolean }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submitCreate(fd: FormData) {
    fd.set('tournamentId', tournamentId)
    startTransition(async () => {
      const r = await createScheduleEntryAction(fd)
      if (!r.ok) setError(r.error); else setError(null)
    })
  }
  function submitUpdate(entryId: string, fd: FormData) {
    fd.set('tournamentId', tournamentId); fd.set('entryId', entryId)
    startTransition(async () => {
      const r = await updateScheduleEntryAction(fd)
      if (!r.ok) setError(r.error); else setError(null)
    })
  }
  function submitDelete(entryId: string) {
    if (!confirm('Delete this schedule entry?')) return
    const fd = new FormData(); fd.set('tournamentId', tournamentId); fd.set('entryId', entryId)
    startTransition(async () => {
      const r = await deleteScheduleEntryAction(fd)
      if (!r.ok) setError(r.error); else setError(null)
    })
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {entries.map((e) => (
          <li key={e.id} className="rounded border p-3">
            <form action={(fd) => submitUpdate(e.id, fd)} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-4">
                <Label htmlFor={`label-${e.id}`}>Label</Label>
                <Input id={`label-${e.id}`} name="label" defaultValue={e.label} required disabled={readOnly} />
              </div>
              <div className="col-span-2">
                <Label htmlFor={`kind-${e.id}`}>Kind</Label>
                <select id={`kind-${e.id}`} name="kind" defaultValue={e.kind} disabled={readOnly} className="w-full border rounded h-10 px-2">
                  {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div className="col-span-3">
                <Label htmlFor={`startAt-${e.id}`}>Start</Label>
                <Input id={`startAt-${e.id}`} name="startAt" type="datetime-local" defaultValue={iso(e.startAt)} required disabled={readOnly} />
              </div>
              <div className="col-span-3">
                <Label htmlFor={`endAt-${e.id}`}>End (optional)</Label>
                <Input id={`endAt-${e.id}`} name="endAt" type="datetime-local" defaultValue={iso(e.endAt)} disabled={readOnly} />
              </div>
              <div className="col-span-12">
                <Label htmlFor={`desc-${e.id}`}>Notes</Label>
                <Textarea id={`desc-${e.id}`} name="description" defaultValue={e.description ?? ''} rows={2} disabled={readOnly} />
              </div>
              <div className="col-span-12 flex justify-end gap-2">
                {!readOnly && <Button type="submit" size="sm" disabled={pending}>Save</Button>}
                {!readOnly && <Button type="button" size="sm" variant="ghost" onClick={() => submitDelete(e.id)} disabled={pending}>Delete</Button>}
              </div>
            </form>
          </li>
        ))}
      </ul>

      {!readOnly && (
        <form action={submitCreate} className="rounded border p-3 space-y-2">
          <p className="text-sm font-medium">Add schedule entry</p>
          <div className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-4">
              <Label htmlFor="new-label">Label</Label>
              <Input id="new-label" name="label" required />
            </div>
            <div className="col-span-2">
              <Label htmlFor="new-kind">Kind</Label>
              <select id="new-kind" name="kind" defaultValue="ROUND" className="w-full border rounded h-10 px-2">
                {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div className="col-span-3">
              <Label htmlFor="new-startAt">Start</Label>
              <Input id="new-startAt" name="startAt" type="datetime-local" required />
            </div>
            <div className="col-span-3">
              <Label htmlFor="new-endAt">End (optional)</Label>
              <Input id="new-endAt" name="endAt" type="datetime-local" />
            </div>
          </div>
          <Button type="submit" disabled={pending}>Add entry</Button>
        </form>
      )}

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  )
}
