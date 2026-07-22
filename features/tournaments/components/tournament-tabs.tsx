'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  Megaphone,
  Inbox,
  Wallet,
  Upload,
  Activity as ActivityIcon,
  Settings as SettingsIcon,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = {
  href: (id: string) => string
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  exact?: boolean
}

type Group = { key: string; tabs: Tab[] }

const groups: Group[] = [
  {
    key: 'core',
    tabs: [
      {
        href: (id) => `/tournaments/${id}`,
        label: 'Overview',
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    key: 'participants',
    tabs: [
      {
        href: (id) => `/tournaments/${id}/institutions`,
        label: 'Institutions',
        icon: Building2,
      },
      { href: (id) => `/tournaments/${id}/teams`, label: 'Teams', icon: Users },
      {
        href: (id) => `/tournaments/${id}/adjudicators`,
        label: 'Adjudicators',
        icon: UserCheck,
      },
    ],
  },
  {
    key: 'operations',
    tabs: [
      {
        href: (id) => `/tournaments/${id}/announcements`,
        label: 'Announcements',
        icon: Megaphone,
      },
      {
        href: (id) => `/tournaments/${id}/requests`,
        label: 'Requests',
        icon: Inbox,
      },
      {
        href: (id) => `/tournaments/${id}/finance`,
        label: 'Finance',
        icon: Wallet,
      },
    ],
  },
]

const overflow: Tab[] = [
  {
    href: (id) => `/tournaments/${id}/imports`,
    label: 'Imports',
    icon: Upload,
  },
  {
    href: (id) => `/tournaments/${id}/activity`,
    label: 'Activity',
    icon: ActivityIcon,
  },
]

const settingsTab: Tab = {
  href: (id) => `/tournaments/${id}/settings`,
  label: 'Settings',
  icon: SettingsIcon,
}

function useIsActive() {
  const pathname = usePathname()
  return (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + '/')
}

export function TournamentTabs({ tournamentId }: { tournamentId: string }) {
  const isActive = useIsActive()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const anyOverflowActive = overflow.some((t) => isActive(t.href(tournamentId)))
  const settingsActive = isActive(settingsTab.href(tournamentId))

  return (
    <div className="sticky top-0 z-20 -mt-px border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-1 px-6">
        <nav
          className="flex flex-1 items-center gap-0 overflow-x-auto scroll-quiet"
          role="tablist"
          aria-label="Tournament sections"
        >
          {groups.map((group, gIdx) => (
            <div key={group.key} className="flex items-center">
              {gIdx > 0 && (
                <span
                  aria-hidden
                  className="mx-1.5 h-4 w-px shrink-0 bg-border"
                />
              )}
              <div className="flex items-center">
                {group.tabs.map((t) => (
                  <TabLink
                    key={t.label}
                    tab={t}
                    tournamentId={tournamentId}
                    active={isActive(t.href(tournamentId), t.exact)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-0 border-l border-border pl-1.5 ml-1.5">
          {/* Overflow menu */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="More sections"
              className={cn(
                'relative flex h-10 items-center justify-center gap-1.5 rounded-none px-2.5 text-[13px] transition-colors',
                anyOverflowActive
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
              <span
                aria-hidden
                className={cn(
                  'pointer-events-none absolute inset-x-2 -bottom-px h-[2px] rounded-t-full transition-colors',
                  anyOverflowActive ? 'bg-primary' : 'bg-transparent',
                )}
              />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-pop"
              >
                {overflow.map((t) => {
                  const url = t.href(tournamentId)
                  const active = isActive(url)
                  const Icon = t.icon
                  return (
                    <Link
                      key={t.label}
                      href={url}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors',
                        active
                          ? 'bg-foreground/[0.06] text-foreground font-medium'
                          : 'text-foreground hover:bg-foreground/[0.05]',
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4',
                          active ? 'text-primary' : 'text-muted-foreground',
                        )}
                        strokeWidth={2}
                      />
                      {t.label}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Settings pinned right */}
          <Link
            href={settingsTab.href(tournamentId)}
            aria-label="Settings"
            className={cn(
              'relative flex h-10 items-center justify-center gap-1.5 px-2.5 text-[13px] transition-colors',
              settingsActive
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <SettingsIcon className="h-4 w-4" strokeWidth={2} />
            <span className="hidden lg:inline">Settings</span>
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute inset-x-2 -bottom-px h-[2px] rounded-t-full transition-colors',
                settingsActive ? 'bg-primary' : 'bg-transparent',
              )}
            />
          </Link>
        </div>
      </div>
    </div>
  )
}

function TabLink({
  tab,
  tournamentId,
  active,
}: {
  tab: Tab
  tournamentId: string
  active: boolean
}) {
  const Icon = tab.icon
  const url = tab.href(tournamentId)
  return (
    <Link
      href={url}
      role="tab"
      aria-selected={active}
      className={cn(
        'relative flex h-10 items-center gap-1.5 whitespace-nowrap px-2.5 text-[13px] transition-colors',
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
      {tab.label}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-2 -bottom-px h-[2px] rounded-t-full transition-colors',
          active ? 'bg-primary' : 'bg-transparent',
        )}
      />
    </Link>
  )
}
