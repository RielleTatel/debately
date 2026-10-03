import { RosterSkeleton } from '@/components/ui/roster-skeleton'
export default function Loading() {
  return (
    <div aria-label="Loading roster" className="space-y-3 py-6">
      <div className="h-8 w-40 animate-pulse rounded bg-muted" />
      <RosterSkeleton kind="institutions" />
    </div>
  )
}
