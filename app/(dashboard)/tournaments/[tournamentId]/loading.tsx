import {
  StatusIndicatorsSkeleton,
  SummaryCardsSkeleton,
  RecentActivitySkeleton,
} from '@/features/dashboards/components/tournament-dashboard/skeletons'

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="animate-pulse rounded bg-muted h-7 w-64" />
          <div className="animate-pulse rounded bg-muted h-4 w-48" />
        </div>
        <div className="animate-pulse rounded bg-muted h-4 w-16" />
      </div>
      <StatusIndicatorsSkeleton />
      <SummaryCardsSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <div className="animate-pulse rounded bg-muted h-6 w-40" />
          <RecentActivitySkeleton />
        </div>
        <div className="space-y-3">
          <div className="animate-pulse rounded bg-muted h-6 w-32" />
          <div className="animate-pulse rounded bg-muted h-32 w-full" />
        </div>
      </div>
    </div>
  )
}
