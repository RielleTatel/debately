import { cn } from '@/lib/utils'

type Props = {
  title: string
  description?: string
  icon?: React.ReactNode
  primaryAction?: React.ReactNode
  secondaryAction?: React.ReactNode
  className?: string
  variant?: 'panel' | 'inline'
}

export function EmptyState({
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  className,
  variant = 'panel',
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        variant === 'panel' &&
          'rounded-lg border border-dashed border-border-strong bg-surface/60 px-8 py-14',
        variant === 'inline' && 'py-10',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-foreground/[0.04] text-muted-foreground ring-1 ring-inset ring-border">
          {icon}
        </div>
      )}
      <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}
