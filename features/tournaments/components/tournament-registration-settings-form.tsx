'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateRegistrationSettingsAction } from '@/features/tournaments/actions'
import { SettingsForm } from './_settings-form'
import type { Tournament } from '@prisma/client'

function iso(d: Date | null | undefined) { return d ? new Date(d).toISOString().slice(0, 16) : '' }

export function TournamentRegistrationSettingsForm({ tournament, readOnly }: { tournament: Tournament; readOnly: boolean }) {
  return (
    <SettingsForm action={updateRegistrationSettingsAction} submitLabel="Save registration settings" disabled={readOnly}>
      <input type="hidden" name="tournamentId" value={tournament.id} />
      <div className="flex items-center gap-2">
        <input id="registrationOpen" name="registrationOpen" type="checkbox" value="true" defaultChecked={tournament.registrationOpen} disabled={readOnly} />
        <Label htmlFor="registrationOpen">Registration is open (institutions may claim their portal)</Label>
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxTeamSlots">Total team slots</Label>
        <Input id="maxTeamSlots" name="maxTeamSlots" type="number" min={1} max={10000} defaultValue={tournament.maxTeamSlots} required disabled={readOnly} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxTeamsPerInstitution">Max teams per institution</Label>
          <Input id="maxTeamsPerInstitution" name="maxTeamsPerInstitution" type="number" min={1} max={1000} defaultValue={tournament.maxTeamsPerInstitution ?? ''} disabled={readOnly} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxAdjudicatorsPerInstitution">Max adjudicators per institution</Label>
          <Input id="maxAdjudicatorsPerInstitution" name="maxAdjudicatorsPerInstitution" type="number" min={1} max={1000} defaultValue={tournament.maxAdjudicatorsPerInstitution ?? ''} disabled={readOnly} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="registrationDeadline">Registration deadline</Label>
        <Input id="registrationDeadline" name="registrationDeadline" type="datetime-local" defaultValue={iso(tournament.registrationDeadline)} required disabled={readOnly} />
      </div>
    </SettingsForm>
  )
}
