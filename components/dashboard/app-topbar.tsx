'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

type Crumb = { label: string; href?: string }

function pathToCrumbs(pathname: string): Crumb[] {
  // Best-effort default: split path segments into readable crumbs.
  // Feature-specific layouts can override by rendering their own header.
  const segs = pathname.split('/').filter(Boolean)
  const crumbs: Crumb[] = []
  let acc = ''
  for (const s of segs) {
    acc += '/' + s
    // Skip obviously-id-like segments (uuid, cuid, hex-ish, digits)
    const isIdLike =
      /^[0-9a-fA-F-]{16,}$/.test(s) ||
      /^\d+$/.test(s) ||
      s.startsWith('c') && s.length > 20
    if (isIdLike) continue
    crumbs.push({
      label: s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      href: acc,
    })
  }
  return crumbs
}

export function AppTopBar({ right }: { right?: React.ReactNode }) {
  const pathname = usePathname()
  const crumbs = pathToCrumbs(pathname)

  return (
    <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/80 backdrop-blur px-4">
      <nav aria-label="Breadcrumb" className="min-w-0 flex items-center gap-1.5 text-[13px] overflow-hidden">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <span key={c.href ?? c.label} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" strokeWidth={2} />
              )}
              {isLast || !c.href ? (
                <span className="truncate font-medium text-foreground">{c.label}</span>
              ) : (
                <Link
                  href={c.href}
                  className="truncate text-muted-foreground hover:text-foreground transition-colors"
                >
                  {c.label}
                </Link>
              )}
            </span>
          )
        })}
      </nav>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={cn(
            'hidden md:inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-[12.5px] text-muted-foreground shadow-xs',
            'hover:border-border-strong hover:text-foreground transition-colors',
          )}
          aria-label="Search"
          // Placeholder — CommandBar spec item; wire to a real palette in a follow-up.
        >
          <Search className="h-3.5 w-3.5" strokeWidth={2} />
          Search
          <kbd className="ml-1 rounded border border-border bg-surface px-1 py-0.5 font-mono text-[10px] font-medium text-muted-foreground/80">
            ⌘K
          </kbd>
        </button>
        {right}
      </div>
    </div>
  )
}
