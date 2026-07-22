import { ChartSectionSkeleton } from '@/features/dashboards/components/tournament-analytics/skeletons'

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="animate-pulse rounded bg-muted h-7 w-40" />
      {['Registration', 'Financial', 'Imports', 'Requests'].map((label) => (
        <section key={label} className="space-y-3">
          <div className="animate-pulse rounded bg-muted h-5 w-32" />
          <ChartSectionSkeleton />
        </section>
      ))}
    </div>
  )
}
