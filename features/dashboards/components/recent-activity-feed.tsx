import { ACTION_LABELS } from '@/features/activity/services/action-catalog'
import { Timeline, type TimelineItem } from '@/components/ui/timeline'
import { EmptyState } from '@/components/empty-state/empty-state'
import type { ActivityLog } from '@prisma/client'

type Row = ActivityLog & {
  actor: { displayName: string; avatarUrl: string | null } | null
}

function relTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.round(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function RecentActivityFeed({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        variant="inline"
        title="No activity yet"
        description="Team members' actions on this tournament will appear here."
      />
    )
  }

  const items: TimelineItem[] = rows.map((r) => ({
    id: r.id,
    title: (
      <>
        <span className="font-medium text-foreground">
          {r.actor?.displayName ?? 'System'}
        </span>{' '}
        <span className="text-muted-foreground">
          {ACTION_LABELS[r.action] ?? r.action.toLowerCase().replace(/_/g, ' ')}
        </span>
      </>
    ),
    time: relTime(r.createdAt),
  }))
  return <Timeline items={items} />
}
