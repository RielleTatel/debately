import { cn } from '@/lib/utils'

type Tone = 'default' | 'success' | 'warning' | 'danger'

type Props = {
  label: string
  value: number
  total: number
  hint?: string
  tone?: Tone
  className?: string
}

const barClasses: Record<Tone, string> = {
  default: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-destructive',
}

export function ProgressCard({
  label,
  value,
  total,
  hint,
  tone = 'default',
  className,
}: Props) {
  const pct = total === 0 ? 0 : Math.min(100, Math.round((value / total) * 100))
  return (
    <div className={cn('rounded-lg border border-border bg-card p-4 shadow-xs', className)}>
      <div className="flex items-baseline justify-between">
        <p className="text-[13px] font-medium text-foreground">{label}</p>
        <p className="text-[13px] font-medium text-muted-foreground tabular-nums">
          {value}
          <span className="text-muted-foreground/60"> / {total}</span>
        </p>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
        <div
          className={cn('h-full rounded-full transition-[width] duration-500', barClasses[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[12px]">
        <span className="font-medium tabular-nums text-foreground">{pct}%</span>
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </div>
  )
}
