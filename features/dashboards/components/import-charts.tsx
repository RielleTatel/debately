'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
type Props = { totalImports: number; byStatus: Record<string, number>; rowErrorRate: number }
export function ImportCharts(props: Props) {
  const barData = Object.entries(props.byStatus).map(([name, value]) => ({ name, value }))
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded border p-3"><p className="text-sm font-medium">Total imports</p><p className="text-3xl font-bold">{props.totalImports}</p></div>
      <div className="rounded border p-3"><p className="text-sm font-medium">Row error rate</p><p className="text-3xl font-bold">{(props.rowErrorRate * 100).toFixed(1)}%</p></div>
      <div className="rounded border p-3 col-span-2">
        <p className="text-sm font-medium mb-2">By status</p>
        <ResponsiveContainer width="100%" height={150}><BarChart data={barData}><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" fill="#f59e0b" /></BarChart></ResponsiveContainer>
      </div>
    </div>
  )
}
