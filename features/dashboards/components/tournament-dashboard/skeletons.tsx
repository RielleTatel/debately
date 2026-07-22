function bar(className: string) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

export function StatusIndicatorsSkeleton() {
  return (
    <div className="flex gap-4 flex-wrap">
      {bar('h-6 w-16')}
      {bar('h-6 w-40')}
      {bar('h-6 w-28')}
    </div>
  )
}

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-3 space-y-2">
          {bar('h-3 w-20')}
          {bar('h-5 w-16')}
        </div>
      ))}
    </div>
  )
}

export function RecentActivitySkeleton() {
  return (
    <ul className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex justify-between">
          {bar('h-4 w-48')}
          {bar('h-4 w-24')}
        </li>
      ))}
    </ul>
  )
}
