import { getTournamentById } from '@/features/tournaments/queries'
import { DeadlineCard } from '@/components/ui/deadline-card'
import { EmptyState } from '@/components/empty-state/empty-state'

type Item = { key: string; title: string; date: Date; meta?: string }

export async function DeadlinesPanel({ tournamentId }: { tournamentId: string }) {
  const t = await getTournamentById(tournamentId)
  if (!t) return null

  const items: Item[] = []
  items.push({
    key: 'reg',
    title: 'Registration deadline',
    date: t.registrationDeadline,
    meta: 'Institutions must finish adding teams by this date',
  })
  if (t.paymentDeadline) {
    items.push({
      key: 'pay',
      title: 'Payment deadline',
      date: t.paymentDeadline,
      meta: 'All fees settled',
    })
  }
  items.push({
    key: 'start',
    title: 'Tournament starts',
    date: t.startDate,
    meta: t.venue,
  })

  // Sort by date, upcoming first (overdue at top)
  items.sort((a, b) => a.date.getTime() - b.date.getTime())

  if (items.length === 0) {
    return (
      <EmptyState
        variant="inline"
        title="No deadlines"
        description="Set registration and payment deadlines in Settings to see them here."
      />
    )
  }

  return (
    <div className="space-y-2">
      {items.map((i) => (
        <DeadlineCard key={i.key} title={i.title} date={i.date} meta={i.meta} />
      ))}
    </div>
  )
}
