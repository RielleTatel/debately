'use client'
import { useState, useTransition } from 'react'
import { deleteOrganizationAction } from '@/features/organizations/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function DeleteOrganizationForm({ orgId, orgName }: { orgId: string; orgName: string }) {
  const [confirmName, setConfirmName] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">This action cannot be undone. Type <strong>{orgName}</strong> to confirm.</p>
      <Input value={confirmName} onChange={(e) => setConfirmName(e.target.value)} placeholder={orgName} />
      <Button disabled={confirmName !== orgName || pending} onClick={() => start(async () => {
        const fd = new FormData(); fd.set('orgId', orgId); fd.set('confirmName', confirmName)
        const r = await deleteOrganizationAction(fd)
        if (r && r.ok === false) setMsg(r.error)
      })}>Delete organization</Button>
      {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}
    </div>
  )
}
