'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, FileSpreadsheet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props { tournamentId: string }

export function SettingsSubNav({ tournamentId }: Props) {
  const pathname = usePathname()
  const base = `/tournaments/${tournamentId}/settings`

  const links = [
    { href: base, label: 'General', icon: Settings, exact: true },
    { href: `${base}/registration-sources`, label: 'Registration Sources', icon: FileSpreadsheet },
  ]

  return (
    <nav className="flex items-center gap-0 border-b">
      {links.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href)
        const Icon = l.icon
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              'relative flex h-9 items-center gap-1.5 whitespace-nowrap px-3 text-[13px] transition-colors',
              active
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon
              className={cn(
                'h-3.5 w-3.5 shrink-0',
                active ? 'text-primary' : 'text-muted-foreground/80',
              )}
              strokeWidth={2}
            />
            {l.label}
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute inset-x-2 -bottom-px h-[2px] rounded-t-full transition-colors',
                active ? 'bg-primary' : 'bg-transparent',
              )}
            />
          </Link>
        )
      })}
    </nav>
  )
}
