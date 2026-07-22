import { ImportHistorySkeleton } from '@/features/imports/components/import-history-panel'

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="animate-pulse rounded bg-muted h-7 w-56" />
          <div className="animate-pulse rounded bg-muted h-4 w-72" />
        </div>
        <div className="animate-pulse rounded bg-muted h-10 w-28" />
      </div>
      <ImportHistorySkeleton />
    </div>
  )
}
