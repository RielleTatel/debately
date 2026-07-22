function bar(className: string) {
  return <div className={`animate-pulse rounded bg-foreground/[0.06] ${className}`} />
}

export function StatusIndicatorsSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {bar('h-5 w-16')}
      {bar('h-5 w-40')}
      {bar('h-5 w-28')}
    </div>
  )
}

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4 shadow-xs">
          {bar('h-3 w-16')}
          <div className="mt-3">{bar('h-6 w-20')}</div>
          <div className="mt-2">{bar('h-3 w-24')}</div>
        </div>
      ))}
    </div>
  )
}

export function RegistrationHealthSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            {bar('h-4 w-32')}
            {bar('h-3 w-12')}
          </div>
          <div className="mt-3">{bar('h-1.5 w-full')}</div>
          <div className="mt-3">{bar('h-3 w-24')}</div>
        </div>
      ))}
    </div>
  )
}

export function DeadlinesSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2.5 shadow-xs"
        >
          <div className="space-y-1">
            {bar('h-4 w-40')}
            {bar('h-3 w-56')}
          </div>
          {bar('h-5 w-16')}
        </div>
      ))}
    </div>
  )
}

export function RecentActivitySkeleton() {
  return (
    <ol className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-foreground/[0.08]" />
          {bar('h-4 flex-1')}
          {bar('h-3 w-12')}
        </li>
      ))}
    </ol>
  )
}
