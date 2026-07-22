import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

export type TimelineItem = {
  id: string
  title: React.ReactNode
  meta?: string
  time: React.ReactNode
  tone?: Tone
  icon?: React.ReactNode
}

const dotClasses: Record<Tone, string> = {
  neutral: 'bg-foreground/40 ring-foreground/10',
  info: 'bg-primary ring-primary/20',
  success: 'bg-success ring-success/20',
  warning: 'bg-warning ring-warning/25',
  danger: 'bg-destructive ring-destructive/20',
}

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cn('relative space-y-0', className)}>
      {items.map((it, i) => (
        <li key={it.id} className="relative flex gap-3 pl-1">
          {/* vertical connector */}
          {i < items.length - 1 && (
            <span className="absolute left-[7px] top-4 bottom-[-14px] w-px bg-border" aria-hidden />
          )}
          <span
            className={cn(
              'relative z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full ring-4',
              dotClasses[it.tone ?? 'neutral'],
            )}
          />
          <div className="flex min-w-0 flex-1 items-start justify-between gap-3 pb-3.5">
            <div className="min-w-0">
              <p className="text-[13px] text-foreground leading-snug">{it.title}</p>
              {it.meta && (
                <p className="mt-0.5 text-[12px] text-muted-foreground">{it.meta}</p>
              )}
            </div>
            <span className="shrink-0 text-[11.5px] font-medium text-muted-foreground tabular-nums">
              {it.time}
            </span>
          </div>
        </li>
      ))}
    </ol>
  )
}
