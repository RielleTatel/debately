'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { approveRequestAction } from '@/features/requests/actions/approve'
import { rejectRequestAction } from '@/features/requests/actions/reject'
import { requestMoreInfoAction } from '@/features/requests/actions/request-more-info'

export function RequestActionsPanel({ requestId, status }: { requestId: string; status: string }) {
  const [error, setError] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [moreInfoNote, setMoreInfoNote] = useState('')
  const [pending, startTransition] = useTransition()

  if (status !== 'PENDING' && status !== 'MORE_INFO') return null

  const approve = () =>
    startTransition(async () => {
      const fd = new FormData()
      fd.set('requestId', requestId)
      const r = await approveRequestAction(fd)
      if (!r.ok) setError(r.error)
    })

  const reject = () =>
    startTransition(async () => {
      const fd = new FormData()
      fd.set('requestId', requestId)
      fd.set('reason', rejectReason)
      const r = await rejectRequestAction(fd)
      if (!r.ok) setError(r.error)
    })

  const moreInfo = () =>
    startTransition(async () => {
      const fd = new FormData()
      fd.set('requestId', requestId)
      fd.set('note', moreInfoNote)
      const r = await requestMoreInfoAction(fd)
      if (!r.ok) setError(r.error)
    })

  return (
    <div className="space-y-3 rounded-md border p-3">
      <p className="text-sm font-medium">Actions</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={approve} disabled={pending}>Approve</Button>
        <div className="flex gap-2 items-center">
          <Input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Rejection reason"
            className="h-8 w-40 text-sm"
          />
          <Button
            size="sm"
            variant="destructive"
            onClick={reject}
            disabled={pending || !rejectReason.trim()}
          >
            Reject
          </Button>
        </div>
        <div className="flex gap-2 items-center">
          <Input
            value={moreInfoNote}
            onChange={(e) => setMoreInfoNote(e.target.value)}
            placeholder="More info note"
            className="h-8 w-44 text-sm"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={moreInfo}
            disabled={pending || !moreInfoNote.trim()}
          >
            Request more info
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
