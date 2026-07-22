export default function Loading() {
  return (
    <section className="space-y-4">
      <div className="animate-pulse rounded bg-muted h-5 w-24" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded bg-muted h-4 w-full max-w-md" />
        ))}
      </div>
    </section>
  )
}
