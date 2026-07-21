import { Badge } from '@/components/ui/badge'
import type { Adjudicator, TournamentInstitution } from '@prisma/client'

type Row = Adjudicator & { institution: TournamentInstitution | null }

export function AdjudicatorList({ adjudicators, showDirectorNotes }: { adjudicators: Row[]; showDirectorNotes: boolean }) {
  if (adjudicators.length === 0) return <p className="text-sm text-muted-foreground">No adjudicators registered.</p>
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left text-xs uppercase text-muted-foreground">
          <th className="py-2">Name</th>
          <th>Institution</th>
          <th>Experience</th>
          <th>Availability</th>
          {showDirectorNotes && <th>Director notes</th>}
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {adjudicators.map((a) => (
          <tr key={a.id} className="border-b">
            <td className="py-2 font-medium">{a.displayName}</td>
            <td>{a.institution?.name ?? 'Independent'}</td>
            <td>{a.experienceLevel ?? '—'}</td>
            <td className="text-xs">{a.availabilityNotes ?? '—'}</td>
            {showDirectorNotes && <td className="text-xs">{a.directorNotes ?? '—'}</td>}
            <td>
              <Badge variant={a.status === 'WITHDRAWN' ? 'destructive' : 'secondary'}>
                {a.status === 'WITHDRAWN' ? 'Withdrawn' : 'Active'}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
