'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { submitReceiptAction } from '@/features/finance/actions/submit-receipt'

export function ReceiptUploader({ invoiceId, currency, onSubmitted }: { invoiceId: string; currency: string; onSubmitted?: () => void }) {
  const [method, setMethod] = useState('BANK_TRANSFER')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  async function onSubmit(fd: FormData) {
    setError(null)
    fd.set('invoiceId', invoiceId); fd.set('currency', currency); fd.set('method', method)
    startTransition(async () => {
      const r = await submitReceiptAction(fd)
      if (!r.ok) setError(r.error); else onSubmitted?.()
    })
  }

  return (
    <form action={onSubmit} className="space-y-3 rounded-md border p-4">
      <p className="text-sm font-medium">Upload payment receipt</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label htmlFor="amountInput">Amount ({currency})</Label><Input id="amountInput" name="amountInput" required inputMode="decimal" placeholder="0.00" /></div>
        <div className="space-y-1"><Label htmlFor="paymentDate">Payment date</Label><Input id="paymentDate" name="paymentDate" type="date" required /></div>
        <div className="space-y-1"><Label htmlFor="referenceNumber">Reference number</Label><Input id="referenceNumber" name="referenceNumber" required maxLength={120} /></div>
        <div className="space-y-1"><Label htmlFor="methodSelect">Method</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger id="methodSelect"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="BANK_TRANSFER">Bank transfer</SelectItem>
              <SelectItem value="GCASH">GCash</SelectItem>
              <SelectItem value="CHECK">Check</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1"><Label htmlFor="file">Receipt file (PDF/JPG/PNG, max 10MB)</Label><Input id="file" name="file" type="file" accept="application/pdf,image/jpeg,image/png" required /></div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <Button type="submit" disabled={pending}>{pending ? 'Uploading...' : 'Submit receipt'}</Button>
    </form>
  )
}
