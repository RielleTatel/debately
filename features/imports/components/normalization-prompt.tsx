'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { confirmNormalizationAction } from '@/features/imports/actions'
import type { NormalizationPrompt } from '@/features/imports/types'
import type { TournamentInstitution } from '@prisma/client'

export function NormalizationPromptCard({
  importId, prompt, institutions,
}: {
  importId: string
  prompt: NormalizationPrompt
  institutions: TournamentInstitution[]
}) {
  const [state, setState] = useState<'idle' | 'confirmed' | 'rejected'>('idle')
  const [error, setError] = useState<string | null>(null)
  const decide = async (decision: 'confirm' | 'reject', targetInstitutionId?: string) => {
    setError(null)
    const fd = new FormData()
    fd.append('importId', importId); fd.append('rawName', prompt.rawName); fd.append('decision', decision)
    if (targetInstitutionId) fd.append('targetInstitutionId', targetInstitutionId)
    const r = await confirmNormalizationAction(fd)
    if (!r.ok) { setError(r.error); return }
    setState(decision === 'confirm' ? 'confirmed' : 'rejected')
  }
  if (state !== 'idle') {
    return (
      <div className="rounded-lg border p-3 text-sm">
        <p>&ldquo;{prompt.rawName}&rdquo; — {state === 'confirmed' ? 'Mapped to existing' : 'Kept as new'}.</p>
      </div>
    )
  }
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <p className="text-sm">
        &ldquo;{prompt.rawName}&rdquo; looks close to <strong>{prompt.suggestedName}</strong> (distance {prompt.distance}).
      </p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => decide('confirm', prompt.suggestedInstitutionId)}>
          Yes — same institution
        </Button>
        <Button size="sm" variant="outline" onClick={() => decide('reject')}>No — keep separate</Button>
      </div>
    </div>
  )
}
