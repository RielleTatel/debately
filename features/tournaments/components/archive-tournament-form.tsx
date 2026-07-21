'use client'
import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  archiveTournamentAction, unarchiveTournamentAction,
} from '@/features/tournaments/actions'
import type { Tournament } from '@prisma/client'

export function ArchiveTournamentForm({ tournament, isOwner }: { tournament: Tournament; isOwner: boolean }) {
  const [confirmName, setConfirmName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onArchive() {
    setError(null)
    const fd = new FormData(); fd.set('tournamentId', tournament.id); fd.set('confirmName', confirmName)
    startTransition(async () => {
      const r = await archiveTournamentAction(fd)
      if (!r.ok) setError(r.error)
    })
  }
  function onUnarchive() {
    setError(null)
    const fd = new FormData(); fd.set('tournamentId', tournament.id)
    startTransition(async () => {
      const r = await unarchiveTournamentAction(fd)
      if (!r.ok) setError(r.error)
    })
  }

  if (tournament.status === 'ARCHIVED') {
    if (!isOwner) return <p className="text-sm text-muted-foreground">Archived. Only the organization owner can un-archive.</p>
    return (
      <div className="space-y-2">
        <p className="text-sm">This tournament is archived. Un-archiving moves it back to Completed.</p>
        <Button type="button" variant="outline" onClick={onUnarchive} disabled={pending}>Un-archive</Button>
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm">Archiving makes this tournament read-only. Type the tournament name to confirm.</p>
      <div className="space-y-2">
        <Label htmlFor="confirmName">Tournament name</Label>
        <Input id="confirmName" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} placeholder={tournament.name} />
      </div>
      <Button type="button" variant="destructive" onClick={onArchive} disabled={pending || confirmName !== tournament.name}>
        Archive tournament
      </Button>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  )
}
