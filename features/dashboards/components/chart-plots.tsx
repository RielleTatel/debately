'use client'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
export type PlotProps = { height: number; label: string } & (
  | {
      kind: 'registration'
      data: Array<{ date: string; teamsCumulative: number; adjudicatorsCumulative: number }>
    }
  | { kind: 'claims' | 'bar'; data: Array<{ name: string; value: number }> }
)
export function ChartPlot(props: PlotProps) {
  if (props.kind === 'registration')
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={props.data}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Line
            isAnimationActive={false}
            type="monotone"
            dataKey="teamsCumulative"
            stroke="#2563eb"
          />
          <Line
            isAnimationActive={false}
            type="monotone"
            dataKey="adjudicatorsCumulative"
            stroke="#059669"
          />
        </LineChart>
      </ResponsiveContainer>
    )
  if (props.kind === 'claims')
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            isAnimationActive={false}
            data={props.data}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={70}
            label
          >
            <Cell fill="#059669" />
            <Cell fill="#f59e0b" />
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    )
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={props.data}>
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip />
        <Bar isAnimationActive={false} dataKey="value" fill="#2563eb" />
      </BarChart>
    </ResponsiveContainer>
  )
}
