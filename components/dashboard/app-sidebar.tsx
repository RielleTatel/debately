'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Trophy,
  Building2,
  Settings as SettingsIcon,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserMenu } from './user-menu'

const nav = [
  { href: '/dashboard', label: 'Home', icon: Home, exact: true },
  { href: '/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/organization', label: 'Organizations', icon: Building2 },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
]

type Props = {
  email: string
  displayName: string | null
  avatarUrl: string | null
}

export function AppSidebar({ email, displayName, avatarUrl }: Props) {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="hidden md:flex h-full w-[220px] shrink-0 flex-col border-r border-border bg-surface">
      {/* Wordmark */}
      <div className="flex h-14 items-center px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-[11px] font-bold text-background">
            D
          </span>
          <span className="text-[14px] font-semibold tracking-tight text-foreground">
            Debately
          </span>
        </Link>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 scroll-quiet">
        <ul className="space-y-0.5">
          {nav.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'group flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] transition-colors',
                    active
                      ? 'bg-foreground/[0.06] text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                    )}
                    strokeWidth={2}
                  />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Upgrade hint / product update card (optional soft footer) */}
      <div className="px-2 pb-2">
        <div className="rounded-md border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
            What&apos;s new
          </div>
          <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
            Faster dashboards & streamed status.
          </p>
        </div>
      </div>

      {/* User pill */}
      <div className="border-t border-border p-2">
        <UserMenu
          email={email}
          displayName={displayName}
          avatarUrl={avatarUrl}
          variant="sidebar"
        />
      </div>
    </aside>
  )
}
