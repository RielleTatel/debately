'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { assignDirectorAction, removeDirectorAction } from '@/features/tournaments/actions'

type Director = { id: string; profileId: string; displayName: string; avatarUrl: string | null }
type Candidate = { profileId: string; displayName: string; role: 'OWNER' | 'MEMBER' }

export function TournamentDirectorsPanel({
  tournamentId, directors, candidates, isOwner,
}: { tournamentId: string; directors: Director[]; candidates: Candidate[]; isOwner: boolean }) {
  const [selected, setSelected] = useState(candidates[0]?.profileId ?? '')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onAssign() {
    if (!selected) return
    setError(null)
    const fd = new FormData(); fd.set('tournamentId', tournamentId); fd.set('profileId', selected)
    startTransition(async () => {
      const r = await assignDirectorAction(fd)
      if (!r.ok) setError(r.error)
    })
  }
  function onRemove(profileId: string, displayName: string) {
    if (!confirm(`Remove ${displayName} as director?`)) return
    setError(null)
    const fd = new FormData(); fd.set('tournamentId', tournamentId); fd.set('profileId', profileId); fd.set('confirm', 'true')
    startTransition(async () => {
      const r = await removeDirectorAction(fd)
      if (!r.ok) setError(r.error)
    })
  }

  return (
    <div className="space-y-4">
      <ul className="divide-y rounded-md border">
        {directors.length === 0 && (
          <li className="p-3 text-sm text-muted-foreground">
            No explicit directors. The organization owner has director rights by default.
          </li>
        )}
        {directors.map((d) => (
          <li key={d.id} className="flex items-center justify-between p-3">
            <span className="text-sm">{d.displayName}</span>
            {isOwner && (
              <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(d.profileId, d.displayName)} disabled={pending}>
                Remove
              </Button>
            )}
          </li>
        ))}
      </ul>

      {isOwner && candidates.length > 0 && (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger><SelectValue placeholder="Choose a member" /></SelectTrigger>
              <SelectContent>
                {candidates.map((c) => (
                  <SelectItem key={c.profileId} value={c.profileId}>
                    {c.displayName} ({c.role.toLowerCase()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" onClick={onAssign} disabled={!selected || pending}>Assign as director</Button>
        </div>
      )}

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  )
}
