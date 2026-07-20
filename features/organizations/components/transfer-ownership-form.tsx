'use client'
import { useState, useTransition } from 'react'
import { transferOwnershipAction } from '@/features/organizations/actions'
import { Button } from '@/components/ui/button'
import type { MemberWithProfile } from '@/features/organizations/types'

export function TransferOwnershipForm({ orgId, members, currentOwnerProfileId }: {
  orgId: string; members: MemberWithProfile[]; currentOwnerProfileId: string
}) {
  const [target, setTarget] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const eligible = members.filter((m) => m.profileId !== currentOwnerProfileId)
  return (
    <div className="space-y-3">
      <label className="block"><span className="text-sm">Transfer to</span>
        <select className="mt-1 block w-full rounded border p-2" value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="">Select a member…</option>
          {eligible.map((m) => (<option key={m.profileId} value={m.profileId}>{m.profile.displayName}</option>))}
        </select>
      </label>
      <Button disabled={!target || pending} onClick={() => start(async () => {
        const fd = new FormData(); fd.set('orgId', orgId); fd.set('toProfileId', target)
        const r = await transferOwnershipAction(fd)
        setMsg(r.ok ? 'Ownership transferred.' : r.error)
      })}>Transfer ownership</Button>
      {msg && <p role="status" className="text-sm">{msg}</p>}
    </div>
  )
}
