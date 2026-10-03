function Card({ height }: { height: number }) {
  return <div style={{ minHeight: height }} className="animate-pulse rounded border bg-muted/50" />
}
export function RegistrationSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[0, 1, 2].map((i) => (
        <Card key={i} height={274} />
      ))}
    </div>
  )
}
export function FinancialSkeleton() {
  return (
    <div>
      <div className="mb-2 h-5 w-12 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card height={254} />
        <Card height={254} />
      </div>
    </div>
  )
}
export function ImportSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card height={86} />
      <Card height={86} />
      <div className="sm:col-span-2">
        <Card height={198} />
      </div>
    </div>
  )
}
export function RequestSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card height={86} />
      <Card height={86} />
      <div className="sm:col-span-2">
        <Card height={248} />
      </div>
    </div>
  )
}
