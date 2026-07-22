import { formatAmount } from '@/lib/money'
import { Badge } from '@/components/ui/badge'
import type { ReceiptWithUploader } from '@/features/finance/types'

const STATUS_COLOR: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  SUBMITTED: 'default', APPROVED: 'secondary', REJECTED: 'destructive',
}

export function ReceiptsList({ receipts, currency }: { receipts: ReceiptWithUploader[]; currency: string }) {
  if (receipts.length === 0) return <p className="text-sm text-muted-foreground">No receipts submitted yet.</p>
  return (
    <ul className="divide-y rounded-lg border">
      {receipts.map((r) => (
        <li key={r.id} className="p-3 text-sm flex items-center justify-between">
          <div>
            <p className="font-medium">{formatAmount(r.amountMinor, currency)} — {r.method}</p>
            <p className="text-xs text-muted-foreground">Ref: {r.referenceNumber} · {new Date(r.paymentDate).toLocaleDateString()} · by {r.uploader.displayName}</p>
          </div>
          <Badge variant={STATUS_COLOR[r.status]}>{r.status}</Badge>
        </li>
      ))}
    </ul>
  )
}
