import Link from 'next/link'
import { cn } from '@/lib/utils'

type Props = {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  trend?: {
    direction: 'up' | 'down' | 'flat'
    label: string
  }
  href?: string
  icon?: React.ReactNode
  className?: string
}

const trendClasses = {
  up: 'text-success',
  down: 'text-destructive',
  flat: 'text-muted-foreground',
}

export function MetricCard({
  label,
  value,
  hint,
  trend,
  href,
  icon,
  className,
}: Props) {
  const inner = (
    <>
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        {icon && <span className="text-muted-foreground/70">{icon}</span>}
      </div>
      <p className="mt-1.5 text-[26px] font-semibold tracking-tight text-foreground leading-none tabular-nums">
        {value}
      </p>
      {(hint || trend) && (
        <div className="mt-2 flex items-center gap-2 text-[12px]">
          {trend && (
            <span className={cn('font-medium tabular-nums', trendClasses[trend.direction])}>
              {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.label}
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </>
  )

  const base = cn(
    'block rounded-lg border border-border bg-card p-4 shadow-xs',
    href && 'transition-colors hover:border-border-strong hover:bg-surface',
    className,
  )

  if (href) return <Link href={href} className={base}>{inner}</Link>
  return <div className={base}>{inner}</div>
}
