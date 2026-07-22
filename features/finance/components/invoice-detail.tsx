import { formatAmount } from '@/lib/money'
import type { InvoiceWithLineItems } from '@/features/finance/types'
import { DiscountForm } from './discount-form'
import { OverrideForm } from './override-form'

export function InvoiceDetail({ invoice }: { invoice: InvoiceWithLineItems }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Invoice #{invoice.invoiceNumber}</p>
        <table className="w-full text-sm mt-2">
          <thead><tr className="border-b text-left text-xs uppercase text-muted-foreground"><th className="py-2">Item</th><th>Qty</th><th>Unit</th><th>Subtotal</th></tr></thead>
          <tbody>
            {invoice.lineItems.map((l) => (<tr key={l.id} className="border-b"><td className="py-2">{l.label}</td><td>{l.quantity}</td><td>{formatAmount(l.unitPriceMinor, invoice.currency)}</td><td>{formatAmount(l.subtotalMinor, invoice.currency)}</td></tr>))}
          </tbody>
        </table>
        <div className="text-right text-sm mt-2 space-y-1">
          <p className="text-muted-foreground">Subtotal: {formatAmount(invoice.subtotalMinor, invoice.currency)}</p>
          {invoice.discountMinor > 0 && <p className="text-muted-foreground">Discount: -{formatAmount(invoice.discountMinor, invoice.currency)} ({invoice.discountReason})</p>}
          <p className="font-bold text-lg">Total: {formatAmount(invoice.totalMinor, invoice.currency)}</p>
          {invoice.overrideMinor !== null && <p className="text-xs text-amber-600">Manually overridden: {invoice.overrideReason}</p>}
        </div>
      </div>
      <DiscountForm invoiceId={invoice.id} currency={invoice.currency} />
      <OverrideForm invoiceId={invoice.id} currency={invoice.currency} hasOverride={invoice.overrideMinor !== null} />
    </div>
  )
}
