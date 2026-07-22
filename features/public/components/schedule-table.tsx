type Entry = {
  id: string
  label: string
  kind: string
  startAt: Date
  endAt: Date | null
  description: string | null
}

export function ScheduleTable({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) return <p className="text-sm text-muted-foreground">No schedule yet.</p>
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Schedule</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase text-muted-foreground">
            <th className="py-2">Time</th>
            <th>Activity</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} className="border-b">
              <td className="py-2 text-xs">
                {new Date(e.startAt).toLocaleString()}
                {e.endAt && ` - ${new Date(e.endAt).toLocaleTimeString()}`}
              </td>
              <td className="py-2 font-medium">{e.label}</td>
              <td className="py-2 text-xs text-muted-foreground">{e.description ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
