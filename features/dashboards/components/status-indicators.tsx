export function StatusIndicators({ tournament, filled, totalSlots }: { tournament: any; filled: number; totalSlots: number }) {
  const pct = totalSlots === 0 ? 0 : Math.min(100, Math.round((filled / totalSlots) * 100))
  return (
    <div className="flex gap-4 flex-wrap">
      <span className="text-xs px-2 py-1 rounded border">{tournament.status}</span>
      <span className="text-xs px-2 py-1 rounded border">{pct}% capacity filled ({filled}/{totalSlots})</span>
      {tournament.registrationOpen && <span className="text-xs px-2 py-1 rounded border bg-green-50 text-green-700">Registration open</span>}
    </div>
  )
}
