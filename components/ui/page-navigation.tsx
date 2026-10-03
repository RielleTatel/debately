import Link from 'next/link'
import type { PageInput, SearchParams } from '@/lib/pagination'

export function PageNavigation({
  pathname,
  params = {},
  paging,
  total,
  pageKey = 'page',
  pageSizeKey = 'pageSize',
}: {
  pathname: string
  params?: SearchParams
  paging: PageInput
  total: number
  pageKey?: string
  pageSizeKey?: string
}) {
  function href(page: number) {
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (key === pageKey || value === undefined) continue
      for (const item of Array.isArray(value) ? value : [value]) query.append(key, item)
    }
    query.set(pageKey, String(page))
    query.set(pageSizeKey, String(paging.pageSize))
    return `${pathname}?${query}`
  }
  const first = total === 0 || paging.skip >= total ? 0 : paging.skip + 1
  const last = first === 0 ? 0 : Math.min(paging.skip + paging.pageSize, total)
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 py-3 text-sm">
      <p className="text-muted-foreground tabular-nums">
        {first}–{last} of {total}
      </p>
      <div className="flex gap-4">
        {paging.skip >= total && paging.page > 1 && (
          <Link prefetch={false} href={href(1)} className="underline">
            First
          </Link>
        )}
        {paging.page > 1 && (
          <Link prefetch={false} href={href(paging.page - 1)} className="underline">
            Previous
          </Link>
        )}
        {last < total && (
          <Link prefetch={false} href={href(paging.page + 1)} className="underline">
            Next
          </Link>
        )}
      </div>
    </nav>
  )
}
