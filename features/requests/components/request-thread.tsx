import type { RequestActivity } from '@prisma/client'

type ActivityWithActor = RequestActivity & { actor: { displayName: string; avatarUrl: string | null } }

export function RequestThread({ activities }: { activities: ActivityWithActor[] }) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium">Activity</h3>
      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {activities.map((a) => (
            <li key={a.id} className="flex gap-2">
              <span className="font-medium text-xs uppercase text-muted-foreground">{a.kind}</span>
              <span>by {a.actor.displayName}</span>
              <span className="text-muted-foreground">· {new Date(a.createdAt).toLocaleString()}</span>
              {a.note && <span className="text-muted-foreground">: {a.note}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
