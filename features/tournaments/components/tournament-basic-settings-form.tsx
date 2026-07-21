'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateTournamentBasicAction } from '@/features/tournaments/actions'
import { SettingsForm } from './_settings-form'
import type { Tournament } from '@prisma/client'

function iso(d: Date | null | undefined) {
  return d ? new Date(d).toISOString().slice(0, 16) : ''
}

export function TournamentBasicSettingsForm({ tournament, readOnly }: { tournament: Tournament; readOnly: boolean }) {
  return (
    <SettingsForm action={updateTournamentBasicAction} submitLabel="Save basic info" disabled={readOnly}>
      <input type="hidden" name="tournamentId" value={tournament.id} />
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={tournament.name} required minLength={3} maxLength={120} disabled={readOnly} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={tournament.slug} required pattern="[a-z0-9-]+" minLength={3} maxLength={64} disabled={readOnly} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={tournament.description ?? ''} rows={4} maxLength={2000} disabled={readOnly} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="venue">Venue</Label>
        <Input id="venue" name="venue" defaultValue={tournament.venue} required maxLength={200} disabled={readOnly} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={tournament.address} required maxLength={500} disabled={readOnly} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start date</Label>
          <Input id="startDate" name="startDate" type="datetime-local" defaultValue={iso(tournament.startDate)} required disabled={readOnly} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End date</Label>
          <Input id="endDate" name="endDate" type="datetime-local" defaultValue={iso(tournament.endDate)} required disabled={readOnly} />
        </div>
      </div>
    </SettingsForm>
  )
}
