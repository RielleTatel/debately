import { Badge } from '@/components/ui/badge'
import type { ExpectationsRow } from '@/features/imports/queries/expectations'

const TONE: Record<ExpectationsRow['status'], 'default' | 'destructive' | 'outline' | 'secondary'> = {
  match: 'secondary', short: 'destructive', over: 'destructive', unknown: 'outline',
}

export function ExpectationsTable({ rows }: { rows: ExpectationsRow[] }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">No institutions imported yet.</p>
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left text-xs uppercase text-muted-foreground">
          <th className="py-2">Institution</th>
          <th>Teams intended</th>
          <th>Teams registered</th>
          <th>Adj intended</th>
          <th>Adj registered</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.institutionId} className="border-b">
            <td className="py-2 font-medium">{r.institutionName}</td>
            <td>{r.teamsIntended ?? '—'}</td>
            <td>{r.teamsRegistered}</td>
            <td>{r.adjudicatorsIntended ?? '—'}</td>
            <td>{r.adjudicatorsRegistered}</td>
            <td>
              <Badge variant={TONE[r.status]}>
                {r.status === 'match' ? 'On target' : r.statusNote ?? r.status}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
