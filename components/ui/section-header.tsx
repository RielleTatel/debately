import { cn } from '@/lib/utils'

type Props = {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({ title, description, action, className }: Props) {
  return (
    <div className={cn('flex items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        <h2 className="text-[13px] font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
