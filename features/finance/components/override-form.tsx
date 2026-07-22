'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { overrideTotalAction, clearOverrideAction } from '@/features/finance/actions/override-total'

export function OverrideForm({ invoiceId, currency, hasOverride }: { invoiceId: string; currency: string; hasOverride: boolean }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  async function onSubmit(fd: FormData) {
    setError(null)
    fd.set('invoiceId', invoiceId)
    fd.set('currency', currency)
    startTransition(async () => {
      const r = await overrideTotalAction(fd)
      if (!r.ok) setError(r.error)
    })
  }
  async function clear() {
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('invoiceId', invoiceId)
      const r = await clearOverrideAction(fd)
      if (!r.ok) setError(r.error)
    })
  }
  return (
    <form action={onSubmit} className="space-y-2 rounded-md border p-3">
      <p className="text-sm font-medium">Override total</p>
      <div className="flex gap-2 items-end">
        <div className="space-y-1 flex-1"><Label htmlFor="ovrAmount">New total</Label><Input id="ovrAmount" name="amountInput" required inputMode="decimal" placeholder="0.00" /></div>
        <div className="space-y-1 flex-1"><Label htmlFor="ovrReason">Reason (min 10 chars)</Label><Input id="ovrReason" name="reason" required minLength={10} /></div>
        <div className="flex gap-1"><Button type="submit" disabled={pending} size="sm">Set</Button>{hasOverride && <Button type="button" size="sm" variant="outline" onClick={clear}>Clear</Button>}</div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  )
}
