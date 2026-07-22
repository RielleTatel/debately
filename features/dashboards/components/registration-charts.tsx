'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
type Props = { series: Array<{ date: string; teamsCumulative: number; adjudicatorsCumulative: number }>; capacity: { totalSlots: number; filled: number }; claimBreakdown: { claimed: number; unclaimed: number } }
export function RegistrationCharts({ series, capacity, claimBreakdown }: Props) {
  const pct = capacity.totalSlots === 0 ? 0 : Math.min(100, Math.round((capacity.filled / capacity.totalSlots) * 100))
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded border p-3">
        <p className="text-sm font-medium mb-2">Cumulative registration</p>
        <ResponsiveContainer width="100%" height={200}><LineChart data={series}><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Line type="monotone" dataKey="teamsCumulative" stroke="#2563eb" /><Line type="monotone" dataKey="adjudicatorsCumulative" stroke="#059669" /></LineChart></ResponsiveContainer>
      </div>
      <div className="rounded border p-3">
        <p className="text-sm font-medium mb-2">Capacity</p>
        <p className="text-3xl font-bold">{pct}%</p>
        <p className="text-xs text-muted-foreground mb-2">{capacity.filled}/{capacity.totalSlots} team slots</p>
        <div className="w-full bg-muted rounded h-2"><div className="h-2 bg-primary rounded" style={{ width: `${pct}%` }} /></div>
      </div>
      <div className="rounded border p-3">
        <p className="text-sm font-medium mb-2">Portal claims</p>
        <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={[{ name: 'Claimed', value: claimBreakdown.claimed }, { name: 'Unclaimed', value: claimBreakdown.unclaimed }]} dataKey="value" cx="50%" cy="50%" outerRadius={70} label><Cell fill="#059669" /><Cell fill="#f59e0b" /></Pie><Tooltip /></PieChart></ResponsiveContainer>
      </div>
    </div>
  )
}
