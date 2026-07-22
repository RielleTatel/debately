import { FinanceOverviewSkeleton } from '@/features/finance/components/finance-overview-panel'

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="animate-pulse rounded bg-muted h-7 w-48" />
      <FinanceOverviewSkeleton />
    </div>
  )
}
