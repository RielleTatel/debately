import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  title: string
  description?: string
  href: string
  icon?: React.ReactNode
  external?: boolean
  className?: string
}

export function ActionCard({
  title,
  description,
  href,
  icon,
  external = false,
  className,
}: Props) {
  const inner = (
    <>
      <div className="flex items-start gap-3">
        {icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/8 text-primary ring-1 ring-inset ring-primary/15">
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium tracking-tight text-foreground">{title}</p>
          {description && (
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">{description}</p>
          )}
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" strokeWidth={2} />
      </div>
    </>
  )

  const cls = cn(
    'group block rounded-lg border border-border bg-card p-3.5 shadow-xs transition-colors hover:border-border-strong hover:bg-surface',
    className,
  )

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    )
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  )
}
