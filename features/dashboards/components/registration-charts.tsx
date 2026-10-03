import { ChartHost } from './chart-host'
type Props = {
  series: Array<{ date: string; teamsCumulative: number; adjudicatorsCumulative: number }>
  capacity: { totalSlots: number; filled: number }
  claimBreakdown: { claimed: number; unclaimed: number }
}
export function RegistrationCharts({ series, capacity, claimBreakdown }: Props) {
  const pct =
    capacity.totalSlots === 0
      ? 0
      : Math.min(100, Math.round((capacity.filled / capacity.totalSlots) * 100))
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="min-h-[274px] rounded border p-3">
        <p className="text-sm font-medium mb-2">Cumulative registration</p>
        <ChartHost
          kind="registration"
          data={series}
          height={200}
          label="Cumulative registration chart"
        />
      </div>
      <div className="min-h-[274px] rounded border p-3">
        <p className="text-sm font-medium mb-2">Capacity</p>
        <p className="text-3xl font-bold">{pct}%</p>
        <p className="text-xs text-muted-foreground mb-2">
          {capacity.filled}/{capacity.totalSlots} team slots
        </p>
        <div className="w-full bg-muted rounded h-2">
          <div className="h-2 bg-primary rounded" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="min-h-[274px] rounded border p-3">
        <p className="text-sm font-medium mb-2">Portal claims</p>
        <p className="text-xs text-muted-foreground">
          {claimBreakdown.claimed} claimed · {claimBreakdown.unclaimed} unclaimed
        </p>
        <ChartHost
          kind="claims"
          data={[
            { name: 'Claimed', value: claimBreakdown.claimed },
            { name: 'Unclaimed', value: claimBreakdown.unclaimed },
          ]}
          height={200}
          label="Portal claim chart"
        />
      </div>
    </div>
  )
}
