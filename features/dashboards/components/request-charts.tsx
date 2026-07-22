'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
type Props = { byStatus: Record<string, number>; byType: Record<string, number>; avgResolutionMs: number; approvalRate: number }
export function RequestCharts(props: Props) {
  const hours = (props.avgResolutionMs / 3600000).toFixed(1)
  const typeData = Object.entries(props.byType).map(([name, value]) => ({ name, value }))
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded border p-3"><p className="text-sm font-medium">Avg resolution time</p><p className="text-3xl font-bold">{hours}h</p></div>
      <div className="rounded border p-3"><p className="text-sm font-medium">Approval rate</p><p className="text-3xl font-bold">{(props.approvalRate * 100).toFixed(0)}%</p></div>
      <div className="rounded border p-3 col-span-2">
        <p className="text-sm font-medium mb-2">By type</p>
        <ResponsiveContainer width="100%" height={200}><BarChart data={typeData}><XAxis dataKey="name" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" fill="#7c3aed" /></BarChart></ResponsiveContainer>
      </div>
    </div>
  )
}
