import { requireTournamentReadable } from '@/features/tournaments/permissions'
import { getInstitutionById } from '@/features/institutions/queries'
import { getInstitutionBalance } from '@/features/finance/queries/balance'
import { getInvoiceForInstitution } from '@/features/finance/queries/invoices'
import { listReceiptsForInvoice } from '@/features/finance/queries/receipts'
import { formatAmount } from '@/lib/money'
import { ReceiptUploader } from '@/features/finance/components/receipt-uploader'
import { notFound } from 'next/navigation'

export default async function PerInstitutionFinancePage({ params }: { params: Promise<{ tournamentId: string; institutionId: string }> }) {
  const { tournamentId, institutionId } = await params
  await requireTournamentReadable(tournamentId)
  const institution = await getInstitutionById(institutionId)
  if (!institution || institution.tournamentId !== tournamentId) notFound()

  const balance = await getInstitutionBalance(institutionId)
  const inv = await getInvoiceForInstitution(institutionId)
  const recs = inv ? await listReceiptsForInvoice(inv.id) : []

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{institution.name} — Finance</h1>
      <dl className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border p-3"><dt className="text-xs text-muted-foreground">Invoiced</dt><dd className="text-lg font-medium">{formatAmount(balance.invoicedMinor, balance.currency)}</dd></div>
        <div className="rounded-lg border p-3"><dt className="text-xs text-muted-foreground">Paid</dt><dd className="text-lg font-medium">{formatAmount(balance.paidMinor, balance.currency)}</dd></div>
        <div className="rounded-lg border p-3"><dt className="text-xs text-muted-foreground">Balance</dt><dd className="text-lg font-medium">{formatAmount(balance.balanceMinor, balance.currency)}</dd></div>
      </dl>
      {inv && (
        <div className="space-y-2"><h2 className="text-lg font-medium">Invoice {inv.invoiceNumber}</h2>
          <table className="w-full text-sm"><thead><tr className="border-b text-left text-xs uppercase text-muted-foreground"><th className="py-2">Item</th><th>Qty</th><th>Unit</th><th>Subtotal</th></tr></thead>
            <tbody>{inv.lineItems.map((l) => (<tr key={l.id} className="border-b"><td className="py-2">{l.label}</td><td>{l.quantity}</td><td>{formatAmount(l.unitPriceMinor, inv.currency)}</td><td>{formatAmount(l.subtotalMinor, inv.currency)}</td></tr>))}</tbody>
          </table>
          <div className="text-right text-sm space-y-1"><p className="text-muted-foreground">Subtotal: {formatAmount(inv.subtotalMinor, inv.currency)}</p>{inv.discountMinor > 0 && <p className="text-muted-foreground">Discount: -{formatAmount(inv.discountMinor, inv.currency)}</p>}<p className="font-bold">Total: {formatAmount(inv.totalMinor, inv.currency)}</p></div>
        </div>
      )}
      {recs.length > 0 && (
        <div className="space-y-2"><h2 className="text-lg font-medium">Receipts</h2>
          <ul className="divide-y rounded-lg border">
            {recs.map((r) => (<li key={r.id} className="p-3 text-sm"><p className="font-medium">{formatAmount(r.amountMinor, inv?.currency ?? 'PHP')} — {r.method}</p><p className="text-xs text-muted-foreground">Ref: {r.referenceNumber} · {new Date(r.paymentDate).toLocaleDateString()} · {r.status}</p></li>))}
          </ul>
        </div>
      )}
      {inv && <ReceiptUploader invoiceId={inv.id} currency={inv.currency} />}
    </div>
  )
}
