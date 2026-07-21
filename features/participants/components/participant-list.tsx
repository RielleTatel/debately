import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { Participant, Team } from '@prisma/client'

type Row = Participant & { team: Team | null }

export function ParticipantList({ participants }: { participants: Row[] }) {
  if (participants.length === 0) return <p className="text-sm text-muted-foreground">No participants yet.</p>
  return (
    <ul className="divide-y rounded-lg border">
      {participants.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-4 p-3">
          <div className="min-w-0">
            <p className="truncate font-medium">{p.displayName}</p>
            <p className="text-xs text-muted-foreground">
              {p.team?.name ?? 'Unassigned'} · {p.email ?? 'no email'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {p.eligibility === 'INELIGIBLE' && (
              <Badge variant="destructive" title={p.ineligibilityReason ?? undefined}>Ineligible</Badge>
            )}
            <Link href={`#edit-${p.id}`} className="text-sm underline">Edit</Link>
          </div>
        </li>
      ))}
    </ul>
  )
}
