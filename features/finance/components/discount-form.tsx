'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { applyDiscountAction } from '@/features/finance/actions/apply-discount'

export function DiscountForm({ invoiceId, currency }: { invoiceId: string; currency: string }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  async function onSubmit(fd: FormData) {
    setError(null)
    fd.set('invoiceId', invoiceId)
    fd.set('currency', currency)
    startTransition(async () => {
      const r = await applyDiscountAction(fd)
      if (!r.ok) setError(r.error)
    })
  }
  return (
    <form action={onSubmit} className="space-y-2 rounded-md border p-3">
      <p className="text-sm font-medium">Apply discount</p>
      <div className="flex gap-2 items-end">
        <div className="space-y-1 flex-1">
          <Label htmlFor="discAmount">Amount</Label>
          <Input id="discAmount" name="amountInput" required inputMode="decimal" placeholder="0.00" />
        </div>
        <div className="space-y-1 flex-1">
          <Label htmlFor="discReason">Reason</Label>
          <Input id="discReason" name="reason" required minLength={3} />
        </div>
        <Button type="submit" disabled={pending} size="sm">{pending ? '...' : 'Apply'}</Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  )
}
