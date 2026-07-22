function block(className: string) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

export function ChartSectionSkeleton({ height = 'h-48' }: { height?: string }) {
  return (
    <div className="space-y-3">
      {block('h-4 w-32')}
      {block(`${height} w-full`)}
    </div>
  )
}
