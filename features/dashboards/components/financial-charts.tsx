import { ChartHost } from './chart-host'
import { formatAmount } from '@/lib/money'
type Props = {
  totalInvoicedMinor: number
  totalPaidMinor: number
  outstandingMinor: number
  completionRate: number
  statusCount: Record<string, number>
  currency: string
}
export function FinancialCharts(props: Props) {
  const barData = Object.entries(props.statusCount).map(([name, value]) => ({ name, value }))
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="min-h-[254px] rounded border p-3">
        <p className="text-sm font-medium mb-2">Revenue vs invoiced</p>
        <div className="text-xs space-y-1 mb-2">
          <p>Invoiced: {formatAmount(props.totalInvoicedMinor, props.currency)}</p>
          <p>Paid: {formatAmount(props.totalPaidMinor, props.currency)}</p>
          <p>Outstanding: {formatAmount(props.outstandingMinor, props.currency)}</p>
        </div>
        <div className="w-full bg-muted rounded h-2">
          <div
            className="h-2 bg-green-600 rounded"
            style={{
              width: `${Math.min(100, Math.max(0, Math.round(props.completionRate * 100)))}%`,
            }}
          />
        </div>
      </div>
      <div className="min-h-[254px] rounded border p-3">
        <p className="text-sm font-medium mb-2">Payment status</p>
        <ChartHost kind="bar" data={barData} height={200} label="Financial chart" />
      </div>
    </div>
  )
}
