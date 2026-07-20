'use client'
import { useState, useTransition } from 'react'
import { acceptInvitationAction, declineInvitationAction } from '@/features/invitations/actions'
import { Button } from '@/components/ui/button'

export function AcceptInvitePanel({ token, orgName }: { token: string; orgName: string }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const submit = (fn: typeof acceptInvitationAction | typeof declineInvitationAction) =>
    start(async () => {
      const fd = new FormData(); fd.set('token', token)
      const r = await fn(fd); if (r && r.ok === false) setMsg(r.error)
    })
  return (
    <div className="space-y-3">
      <p>You have been invited to join <strong>{orgName}</strong>.</p>
      <div className="flex gap-2">
        <Button disabled={pending} onClick={() => submit(acceptInvitationAction)}>Accept</Button>
        <Button disabled={pending} variant="outline" onClick={() => submit(declineInvitationAction)}>Decline</Button>
      </div>
      {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}
    </div>
  )
}
