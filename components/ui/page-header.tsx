import { cn } from '@/lib/utils'

type Props = {
  title: string
  description?: string
  eyebrow?: string
  actions?: React.ReactNode
  meta?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  meta,
  className,
}: Props) {
  return (
    <div className={cn('flex flex-col gap-4 md:flex-row md:items-start md:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground mb-2">
            {eyebrow}
          </p>
        )}
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground leading-none">
            {title}
          </h1>
          {meta}
        </div>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
