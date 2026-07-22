'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { approveReceiptAction } from '@/features/finance/actions/approve-receipt'
import { rejectReceiptAction } from '@/features/finance/actions/reject-receipt'

export function ApproveRejectButtons({ receiptId }: { receiptId: string }) {
  const [error, setError] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [pending, startTransition] = useTransition()
  const approve = () => startTransition(async () => {
    const fd = new FormData()
    fd.set('receiptId', receiptId)
    const r = await approveReceiptAction(fd)
    if (!r.ok) setError(r.error)
  })
  const reject = () => startTransition(async () => {
    const fd = new FormData()
    fd.set('receiptId', receiptId)
    fd.set('reason', rejectReason)
    const r = await rejectReceiptAction(fd)
    if (!r.ok) setError(r.error)
  })
  return (
    <div className="space-y-2 rounded-md border p-3">
      <p className="text-sm font-medium">Director actions</p>
      <div className="flex gap-2 items-center">
        <Button size="sm" onClick={approve} disabled={pending}>Approve</Button>
        <Input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Rejection reason" className="h-8 text-sm" />
        <Button size="sm" variant="destructive" onClick={reject} disabled={pending || !rejectReason.trim()}>Reject</Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
