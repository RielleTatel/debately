export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <div className="animate-pulse rounded bg-muted h-7 w-40" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded bg-muted h-14 w-full" />
        ))}
      </div>
    </div>
  )
}
