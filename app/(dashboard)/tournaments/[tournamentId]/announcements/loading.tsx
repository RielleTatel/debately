export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <div className="animate-pulse rounded bg-muted h-7 w-52" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded bg-muted h-16 w-full" />
        ))}
      </div>
    </div>
  )
}
