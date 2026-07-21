'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { updateFormatSettingsAction } from '@/features/tournaments/actions'
import { SettingsForm } from './_settings-form'
import type { Tournament } from '@prisma/client'
import type { FormatConfig } from '@/features/tournaments/types'

export function TournamentFormatSettingsForm({ tournament, readOnly }: { tournament: Tournament; readOnly: boolean }) {
  const initial = (tournament.formatConfig as unknown as FormatConfig) ?? { speakerCount: 3, customEligibility: '' }
  const [format, setFormat] = useState<'BP' | 'AP' | 'WSDC' | 'CP' | 'CUSTOM'>(tournament.format)
  const [speakerCount, setSpeakerCount] = useState(initial.speakerCount)
  const [eligibility, setEligibility] = useState(initial.customEligibility)

  return (
    <SettingsForm action={updateFormatSettingsAction} submitLabel="Save format" disabled={readOnly}>
      <input type="hidden" name="tournamentId" value={tournament.id} />
      <input type="hidden" name="format" value={format} />
      <input type="hidden" name="formatConfig" value={JSON.stringify({ speakerCount, customEligibility: eligibility })} />

      <div className="space-y-2">
        <Label htmlFor="formatSelect">Debate format</Label>
        <Select value={format} onValueChange={(v) => setFormat(v as typeof format)} disabled={readOnly}>
          <SelectTrigger id="formatSelect"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="BP">British Parliamentary</SelectItem>
            <SelectItem value="AP">Asian Parliamentary</SelectItem>
            <SelectItem value="WSDC">World Schools</SelectItem>
            <SelectItem value="CP">Canadian Parliamentary</SelectItem>
            <SelectItem value="CUSTOM">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="speakerCount">Speakers per team</Label>
        <Input id="speakerCount" type="number" min={1} max={10} value={speakerCount} onChange={(e) => setSpeakerCount(Number(e.target.value))} disabled={readOnly} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="eligibility">Custom eligibility notes</Label>
        <Textarea id="eligibility" rows={4} maxLength={2000} value={eligibility} onChange={(e) => setEligibility(e.target.value)} disabled={readOnly} />
      </div>
    </SettingsForm>
  )
}
