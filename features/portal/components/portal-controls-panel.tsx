'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  regenerateTokenAction,
} from '@/features/portal/actions/regenerate-token'
import { disableTokenAction } from '@/features/portal/actions/disable-token'
import type { InstitutionPortalToken, InstitutionClaim } from '@prisma/client'

export function PortalControlsPanel({
  institutionId, token, claim, appOrigin,
}: {
  institutionId: string
  token: InstitutionPortalToken | null
  claim: InstitutionClaim | null
  appOrigin: string
}) {
  const [currentToken, setCurrentToken] = useState(token)
  const [error, setError] = useState<string | null>(null)
  const url = currentToken ? `${appOrigin}/i/${currentToken.token}` : null

  const copy = async () => {
    if (!url) return
    await navigator.clipboard.writeText(url)
  }

  const regenerate = async () => {
    if (!confirm('Regenerate portal link? The current link will stop working immediately.')) return
    const fd = new FormData(); fd.append('institutionId', institutionId)
    const r = await regenerateTokenAction(fd)
    if (!r.ok) { setError(r.error); return }
    setCurrentToken({ ...(currentToken as InstitutionPortalToken), token: r.data.token, active: true })
  }

  const disable = async () => {
    if (!confirm('Disable this portal link? The institution loses access until re-enabled.')) return
    const fd = new FormData(); fd.append('institutionId', institutionId); fd.append('confirm', 'true')
    const r = await disableTokenAction(fd)
    if (!r.ok) { setError(r.error); return }
    setCurrentToken(currentToken ? { ...currentToken, active: false } : null)
  }

  return (
    <div className="space-y-3 rounded-lg border p-4 text-sm">
      <div>
        <p className="font-medium">Portal link</p>
        <p className="mt-1 break-all text-xs text-muted-foreground">{url ?? 'No active token'}</p>
      </div>
      <div>
        <p className="font-medium">Claim status</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {claim ? `Claimed by profile ${claim.profileId} on ${new Date(claim.claimedAt).toLocaleString()}` : 'Not yet claimed'}
        </p>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={copy} disabled={!url}>Copy link</Button>
        <Button size="sm" variant="outline" onClick={regenerate}>Regenerate</Button>
        <Button size="sm" variant="ghost" onClick={disable} disabled={!currentToken?.active}>Disable</Button>
      </div>
    </div>
  )
}
