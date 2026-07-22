export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="animate-pulse rounded bg-muted h-7 w-40" />
        <div className="animate-pulse rounded bg-muted h-10 w-40" />
      </div>
      <ul className="divide-y rounded-md border">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="flex items-center justify-between p-4">
            <div className="space-y-2">
              <div className="animate-pulse rounded bg-muted h-4 w-40" />
              <div className="animate-pulse rounded bg-muted h-3 w-60" />
            </div>
            <div className="animate-pulse rounded bg-muted h-4 w-16" />
          </li>
        ))}
      </ul>
    </div>
  )
}
