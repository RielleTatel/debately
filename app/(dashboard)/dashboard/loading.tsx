import { DashboardBodySkeleton } from '@/features/dashboards/components/user-dashboard/dashboard-body-panel'

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-12">
      <div className="animate-pulse rounded bg-muted h-9 w-64" />
      <DashboardBodySkeleton />
    </div>
  )
}
