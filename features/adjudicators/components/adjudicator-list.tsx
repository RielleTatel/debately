import { StatusBadge } from '@/components/ui/status-badge'
import { EmptyState } from '@/components/empty-state/empty-state'
import { UserCheck } from 'lucide-react'
import type { Adjudicator, TournamentInstitution } from '@prisma/client'
import Link from 'next/link'
import {
  rosterEmptyCardClassName,
  rosterTableHeaderClassName,
  rosterTableRowClassName,
} from '@/components/ui/roster-geometry'

type Row = Pick<Adjudicator, 'id' | 'displayName' | 'status'> & {
  institution: Pick<TournamentInstitution, 'id' | 'name'> | null
}

export function AdjudicatorList({
  adjudicators,
  editBase,
}: {
  adjudicators: Row[]
  editBase?: string
}) {
  if (adjudicators.length === 0) {
    return (
      <EmptyState
        className={rosterEmptyCardClassName}
        icon={<UserCheck className="h-5 w-5" strokeWidth={2} />}
        title="No adjudicators yet"
        description="Adjudicators come in via the same CSV import as teams, or can be added individually from an institution's page."
      />
    )
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <table className="w-full text-sm">
        <thead>
          <tr
            className={`${rosterTableHeaderClassName} border-b border-border bg-surface/60 text-left text-[11.5px] font-medium uppercase tracking-[0.05em] text-muted-foreground`}
          >
            <th className="px-4 py-2.5">Name</th>
            <th className="px-4 py-2.5">Institution</th>
            <th className="px-4 py-2.5">Status</th>
            {editBase && <th className="px-4 py-2.5">Edit</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {adjudicators.map((a) => (
            <tr
              key={a.id}
              className={`${rosterTableRowClassName} transition-colors hover:bg-surface/60`}
            >
              <td className="px-4 py-2 font-medium text-foreground">{a.displayName}</td>
              <td className="px-4 py-2 text-muted-foreground">
                {a.institution?.name ?? (
                  <span className="text-muted-foreground/60">Independent</span>
                )}
              </td>
              <td className="px-4 py-2">
                <StatusBadge tone={a.status === 'WITHDRAWN' ? 'danger' : 'success'} dot>
                  {a.status === 'WITHDRAWN' ? 'Withdrawn' : 'Active'}
                </StatusBadge>
              </td>
              {editBase && (
                <td className="px-4 py-2">
                  <Link prefetch={false} href={`${editBase}/${a.id}/edit`} className="underline">
                    Edit
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
