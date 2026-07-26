import { formatAmount } from '@/lib/money'
import { Badge } from '@/components/ui/badge'
import type { Balance } from '@/features/finance/queries/balance'

type Row = {
  institutionId: string
  institutionName: string
  balance: Balance | null
  declaredPaid: { totalMinor: number; currency: string } | null
}

const STATUS_COLOR: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  PAID: 'secondary', PARTIAL: 'default', UNPAID: 'destructive', OVERPAID: 'outline',
}

export function FinanceOverviewTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">No institutions yet.</p>
  return (
    <table className="w-full text-sm">
      <thead><tr className="border-b text-left text-xs uppercase text-muted-foreground"><th className="py-2">Institution</th><th>Invoiced</th><th>Paid</th><th>Balance</th><th>Declared Paid</th><th>Status</th></tr></thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.institutionId} className="border-b">
            <td className="py-2 font-medium">{r.institutionName}</td>
            <td>{r.balance ? formatAmount(r.balance.invoicedMinor, r.balance.currency) : '—'}</td>
            <td>{r.balance ? formatAmount(r.balance.paidMinor, r.balance.currency) : '—'}</td>
            <td>{r.balance ? formatAmount(r.balance.balanceMinor, r.balance.currency) : '—'}</td>
            <td>{r.declaredPaid ? <span className="font-medium text-emerald-600">{formatAmount(r.declaredPaid.totalMinor, r.declaredPaid.currency)}</span> : '—'}</td>
            <td>{r.balance ? <Badge variant={STATUS_COLOR[r.balance.status]}>{r.balance.status}</Badge> : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
