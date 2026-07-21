'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { updateFinanceSettingsAction } from '@/features/tournaments/actions'
import { SettingsForm } from './_settings-form'
import type { Tournament } from '@prisma/client'
import type { FeeStructure, FeeLine } from '@/features/tournaments/types'

function iso(d: Date | null | undefined) { return d ? new Date(d).toISOString().slice(0, 16) : '' }

export function TournamentFinanceSettingsForm({ tournament, readOnly }: { tournament: Tournament; readOnly: boolean }) {
  const initial = (tournament.feeStructure as unknown as FeeStructure) ?? { kind: 'none', lines: [] }
  const [lines, setLines] = useState<FeeLine[]>(initial.lines)
  const [kind, setKind] = useState<FeeStructure['kind']>(initial.kind)

  return (
    <SettingsForm action={updateFinanceSettingsAction} submitLabel="Save finance settings" disabled={readOnly}>
      <input type="hidden" name="tournamentId" value={tournament.id} />
      <input type="hidden" name="feeStructure" value={JSON.stringify({ kind, lines })} />

      <div className="space-y-2">
        <Label htmlFor="currency">Currency (3-letter ISO)</Label>
        <Input id="currency" name="currency" defaultValue={tournament.currency} maxLength={3} minLength={3} required pattern="[A-Z]{3}" disabled={readOnly} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="feeKind">Fee model</Label>
        <Select value={kind} onValueChange={(v) => setKind(v as FeeStructure['kind'])} disabled={readOnly}>
          <SelectTrigger id="feeKind"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No fees</SelectItem>
            <SelectItem value="itemized">Itemized fees</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {kind === 'itemized' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Fee lines</Label>
            {!readOnly && (
              <Button type="button" variant="outline" size="sm"
                onClick={() => setLines([...lines, { label: '', amount: 0, unit: 'per_team' }])}>
                Add line
              </Button>
            )}
          </div>
          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <Input value={line.label} onChange={(e) => setLines(lines.map((l, j) => j === i ? { ...l, label: e.target.value } : l))} placeholder="e.g. Team registration fee" disabled={readOnly} />
              </div>
              <div className="col-span-3">
                <Input type="number" value={line.amount} min={0} step="0.01" onChange={(e) => setLines(lines.map((l, j) => j === i ? { ...l, amount: Number(e.target.value) } : l))} disabled={readOnly} />
              </div>
              <div className="col-span-3">
                <Select value={line.unit} onValueChange={(v) => setLines(lines.map((l, j) => j === i ? { ...l, unit: v as FeeLine['unit'] } : l))} disabled={readOnly}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_team">per team</SelectItem>
                    <SelectItem value="per_adjudicator">per adjudicator</SelectItem>
                    <SelectItem value="flat">flat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                {!readOnly && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setLines(lines.filter((_, j) => j !== i))} aria-label={`Remove line ${i + 1}`}>×</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="paymentDeadline">Payment deadline (optional)</Label>
        <Input id="paymentDeadline" name="paymentDeadline" type="datetime-local" defaultValue={iso(tournament.paymentDeadline)} disabled={readOnly} />
      </div>
    </SettingsForm>
  )
}
