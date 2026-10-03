import { ChartHost } from './chart-host'
type Props = { totalImports: number; byStatus: Record<string, number>; rowErrorRate: number }
export function ImportCharts(props: Props) {
  const barData = Object.entries(props.byStatus).map(([name, value]) => ({ name, value }))
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="min-h-[86px] rounded border p-3">
        <p className="text-sm font-medium">Total imports</p>
        <p className="text-3xl font-bold">{props.totalImports}</p>
      </div>
      <div className="min-h-[86px] rounded border p-3">
        <p className="text-sm font-medium">Row error rate</p>
        <p className="text-3xl font-bold">{(props.rowErrorRate * 100).toFixed(1)}%</p>
      </div>
      <div className="rounded border p-3 sm:col-span-2">
        <p className="text-sm font-medium mb-2">By status</p>
        <ChartHost kind="bar" data={barData} height={150} label="Import chart" />
      </div>
    </div>
  )
}
