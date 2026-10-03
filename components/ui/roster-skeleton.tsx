import {
  rosterEmptyCardClassName,
  rosterTableHeaderClassName,
  rosterTableRowClassName,
} from './roster-geometry'

export function RosterSkeleton({
  kind = 'teams',
  rows = 50,
}: {
  kind?: 'teams' | 'participants' | 'adjudicators' | 'institutions' | 'finance'
  rows?: number
}) {
  const count = Math.min(100, Math.max(0, rows))
  if (count === 0)
    return (
      <div aria-label="Loading roster" className="space-y-2">
        <div className={kind === 'adjudicators' ? rosterEmptyCardClassName : 'h-5'} />
        <div className="h-11" />
      </div>
    )
  if (kind === 'teams' || kind === 'participants')
    return (
      <div aria-label="Loading roster" className="space-y-2">
        <ul className="divide-y rounded-lg border">
          {Array.from({ length: count }, (_, index) => (
            <li key={index} className="min-h-16 space-y-2 p-3">
              <div className="h-5 w-48 animate-pulse rounded bg-muted" />
              <div className="h-3 w-32 animate-pulse rounded bg-muted" />
            </li>
          ))}
        </ul>
        <div className="h-11" />
      </div>
    )
  const columns = kind === 'adjudicators' ? 3 : 6
  return (
    <div aria-label="Loading roster" className="space-y-2">
      <table className="w-full rounded border text-sm">
        <thead>
          <tr className={`${rosterTableHeaderClassName} border-b`}>
            {Array.from({ length: columns }, (_, index) => (
              <th key={index} className="px-4">
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: count }, (_, row) => (
            <tr key={row} className={`${rosterTableRowClassName} border-b`}>
              {Array.from({ length: columns }, (_, column) => (
                <td key={column} className="px-4">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="h-11" />
    </div>
  )
}
