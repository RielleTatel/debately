import { ACTION_LABELS } from '@/features/activity/services/action-catalog'
import type { ActivityLog } from '@prisma/client'
type Row = ActivityLog & { actor: { displayName: string; avatarUrl: string | null } | null }
export function RecentActivityFeed({ rows }: { rows: Row[] }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">No recent activity.</p>
  return <ul className="space-y-2 text-sm">{rows.map((r) => (<li key={r.id} className="flex justify-between"><span className="text-muted-foreground">{ACTION_LABELS[r.action]}</span><span className="text-xs">{new Date(r.createdAt).toLocaleString()}</span></li>))}</ul>
}
