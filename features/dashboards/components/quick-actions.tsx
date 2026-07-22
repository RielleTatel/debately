import Link from 'next/link'
export function QuickActions({ tournamentId }: { tournamentId: string; isDirector: boolean }) {
  return (
    <div className="space-y-2">
      <Link href={`/tournaments/${tournamentId}/imports/new`} className="block rounded-md border p-2 text-sm hover:bg-muted">Upload CSV</Link>
      <Link href={`/tournaments/${tournamentId}/announcements/new`} className="block rounded-md border p-2 text-sm hover:bg-muted">New announcement</Link>
      <Link href={`/tournaments/${tournamentId}/finance`} className="block rounded-md border p-2 text-sm hover:bg-muted">Finance overview</Link>
      <Link href={`/tournaments/${tournamentId}/requests`} className="block rounded-md border p-2 text-sm hover:bg-muted">Request queue</Link>
    </div>
  )
}
