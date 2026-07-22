import { cn } from '@/lib/utils'
import { StatusBadge } from './status-badge'

type Urgency = 'overdue' | 'today' | 'soon' | 'later'

type Props = {
  title: string
  date: Date
  urgency?: Urgency
  href?: string
  meta?: string
  className?: string
}

const dayMs = 86_400_000

function inferUrgency(date: Date): Urgency {
  const diff = (date.getTime() - Date.now()) / dayMs
  if (diff < 0) return 'overdue'
  if (diff < 1) return 'today'
  if (diff < 7) return 'soon'
  return 'later'
}

function relativeLabel(date: Date): string {
  const diffMs = date.getTime() - Date.now()
  const diffDays = Math.round(diffMs / dayMs)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 0 && diffDays < 7) return `In ${diffDays} days`
  if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)} days ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const toneByUrgency: Record<Urgency, 'danger' | 'warning' | 'info' | 'muted'> = {
  overdue: 'danger',
  today: 'warning',
  soon: 'info',
  later: 'muted',
}

export function DeadlineCard({
  title,
  date,
  urgency,
  href,
  meta,
  className,
}: Props) {
  const u = urgency ?? inferUrgency(date)
  const Wrapper: React.ElementType = href ? 'a' : 'div'
  const wrapperProps = href ? { href } : {}
  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        'group flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 shadow-xs',
        href && 'transition-colors hover:border-border-strong hover:bg-surface',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        {meta && <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{meta}</p>}
      </div>
      <StatusBadge tone={toneByUrgency[u]} dot>
        {relativeLabel(date)}
      </StatusBadge>
    </Wrapper>
  )
}
