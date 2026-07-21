'use client'
import { Label } from '@/components/ui/label'
import { updatePortalSettingsAction } from '@/features/tournaments/actions'
import { SettingsForm } from './_settings-form'
import type { Tournament } from '@prisma/client'

export function TournamentPortalSettingsForm({ tournament, readOnly }: { tournament: Tournament; readOnly: boolean }) {
  return (
    <SettingsForm action={updatePortalSettingsAction} submitLabel="Save portal settings" disabled={readOnly}>
      <input type="hidden" name="tournamentId" value={tournament.id} />
      <div className="flex items-center gap-2">
        <input id="portalActive" name="portalActive" type="checkbox" value="true" defaultChecked={tournament.portalActive} disabled={readOnly} />
        <Label htmlFor="portalActive">Institution portal links are active</Label>
      </div>
      <p className="text-xs text-muted-foreground">
        When active, institutions with a portal token can access their dashboard. Toggle off to disable all portal links at once.
      </p>
    </SettingsForm>
  )
}
