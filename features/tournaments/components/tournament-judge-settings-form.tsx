'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateJudgeRuleAction } from '@/features/tournaments/actions'
import { SettingsForm } from './_settings-form'
import type { Tournament } from '@prisma/client'

export function TournamentJudgeSettingsForm({ tournament, readOnly }: { tournament: Tournament; readOnly: boolean }) {
  return (
    <SettingsForm action={updateJudgeRuleAction} submitLabel="Save judge settings" disabled={readOnly}>
      <input type="hidden" name="tournamentId" value={tournament.id} />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="judgeRule">Judges required per team (N)</Label>
          <Input
            id="judgeRule"
            name="judgeRule"
            type="number"
            min={1}
            max={10}
            defaultValue={tournament.judgeRule ?? ''}
            placeholder="e.g. 1"
            disabled={readOnly}
          />
          <p className="text-xs text-muted-foreground">
            Leave blank to disable the judge rule. With N=1, each institution must bring 1 judge per team.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ghostJudgeFee">Ghost judge fee (per missing judge)</Label>
          <Input
            id="ghostJudgeFee"
            name="ghostJudgeFee"
            type="number"
            min={0}
            step="0.01"
            defaultValue={tournament.ghostJudgeFee ?? ''}
            placeholder="e.g. 350"
            disabled={readOnly}
          />
          <p className="text-xs text-muted-foreground">
            Fee charged per judge an institution is short of their requirement.
          </p>
        </div>
      </div>
    </SettingsForm>
  )
}
