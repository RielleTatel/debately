'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { setEligibilityAction } from '@/features/participants/actions/set-eligibility'
import type { Participant } from '@prisma/client'

export function EligibilityFlagForm({ participant }: { participant: Participant }) {
  const [reason, setReason] = useState(participant.ineligibilityReason ?? '')
  const [error, setError] = useState<string | null>(null)
  const decide = async (eligibility: 'ELIGIBLE' | 'INELIGIBLE') => {
    if (eligibility === 'INELIGIBLE' && !reason.trim()) {
      setError('A reason is required'); return
    }
    const fd = new FormData()
    fd.append('participantId', participant.id); fd.append('eligibility', eligibility)
    if (eligibility === 'INELIGIBLE') fd.append('reason', reason)
    const r = await setEligibilityAction(fd)
    if (!r.ok) setError(r.error)
  }
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <Label>Ineligibility reason (director only)</Label>
      <Input value={reason} onChange={(e) => setReason(e.target.value)} />
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" variant="destructive" onClick={() => decide('INELIGIBLE')}>Mark ineligible</Button>
        <Button size="sm" variant="outline" onClick={() => decide('ELIGIBLE')}>Mark eligible</Button>
      </div>
    </div>
  )
}
