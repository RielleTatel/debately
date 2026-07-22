'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatAmount } from '@/lib/money'
type Props = { totalInvoicedMinor: number; totalPaidMinor: number; outstandingMinor: number; completionRate: number; statusCount: Record<string, number> }
export function FinancialCharts(props: Props) {
  const barData = Object.entries(props.statusCount).map(([name, value]) => ({ name, value }))
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded border p-3">
        <p className="text-sm font-medium mb-2">Revenue vs invoiced</p>
        <div className="text-xs space-y-1 mb-2">
          <p>Invoiced: {formatAmount(props.totalInvoicedMinor, 'PHP')}</p>
          <p>Paid: {formatAmount(props.totalPaidMinor, 'PHP')}</p>
          <p>Outstanding: {formatAmount(props.outstandingMinor, 'PHP')}</p>
        </div>
        <div className="w-full bg-muted rounded h-2"><div className="h-2 bg-green-600 rounded" style={{ width: `${Math.round(props.completionRate * 100)}%` }} /></div>
      </div>
      <div className="rounded border p-3">
        <p className="text-sm font-medium mb-2">Payment status</p>
        <ResponsiveContainer width="100%" height={200}><BarChart data={barData}><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" fill="#2563eb" /></BarChart></ResponsiveContainer>
      </div>
    </div>
  )
}
