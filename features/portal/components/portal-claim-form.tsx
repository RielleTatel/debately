'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { claimPortalAction } from '@/features/portal/actions/claim-portal'

export function PortalClaimForm({ token, institutionName }: { token: string; institutionName: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return (
    <form
      className="space-y-4 rounded-lg border bg-white p-6"
      onSubmit={async (e) => {
        e.preventDefault()
        setPending(true); setError(null)
        const fd = new FormData(); fd.append('token', token)
        const r = await claimPortalAction(fd)
        setPending(false)
        if (!r.ok) { setError(r.error); return }
        router.push(`/portal/${r.data.institutionId}`)
      }}
    >
      <div>
        <h1 className="text-xl font-semibold">Claim the {institutionName} portal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account will be linked as the institution representative.
        </p>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? 'Claiming…' : 'Claim portal'}
        </Button>
      </div>
    </form>
  )
}
