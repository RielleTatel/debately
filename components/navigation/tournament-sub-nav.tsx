'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  DollarSign,
  Megaphone,
  MessageSquare,
  Settings,
  Activity,
  BarChart3,
  Download,
  Upload,
  ChevronLeft,
} from 'lucide-react'

type NavItem = {
  href: (id: string) => string
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  exact?: boolean
}

type Section = { label: string; items: NavItem[] }

const sections: Section[] = [
  {
    label: 'Overview',
    items: [
      { href: (id) => `/tournaments/${id}`, label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Participants',
    items: [
      { href: (id) => `/tournaments/${id}/institutions`, label: 'Institutions', icon: Building2 },
      { href: (id) => `/tournaments/${id}/teams`, label: 'Teams', icon: Users },
      { href: (id) => `/tournaments/${id}/adjudicators`, label: 'Adjudicators', icon: UserCheck },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: (id) => `/tournaments/${id}/announcements`, label: 'Announcements', icon: Megaphone },
      { href: (id) => `/tournaments/${id}/requests`, label: 'Requests', icon: MessageSquare },
      { href: (id) => `/tournaments/${id}/imports`, label: 'Imports', icon: Upload },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: (id) => `/tournaments/${id}/finance`, label: 'Finance', icon: DollarSign },
    ],
  },
  {
    label: 'Admin',
    items: [
      { href: (id) => `/tournaments/${id}/analytics`, label: 'Analytics', icon: BarChart3 },
      { href: (id) => `/tournaments/${id}/activity`, label: 'Activity', icon: Activity },
      { href: (id) => `/tournaments/${id}/exports`, label: 'Exports', icon: Download },
      { href: (id) => `/tournaments/${id}/settings`, label: 'Settings', icon: Settings },
    ],
  },
]

type Props = {
  tournamentId: string
  tournamentName: string
  logoUrl: string | null
  role: 'OWNER' | 'MEMBER'
  isDirector: boolean
}

export function TournamentSubNav({
  tournamentId,
  tournamentName,
  logoUrl,
  role,
  isDirector,
}: Props) {
  const pathname = usePathname()
  const initial = tournamentName.charAt(0).toUpperCase()
  const roleLabel = isDirector ? 'Director' : role === 'OWNER' ? 'Owner' : 'Member'
  const roleClass = isDirector
    ? 'bg-emerald-100 text-emerald-700'
    : role === 'OWNER'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-slate-100 text-slate-600'

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Back to dashboard */}
      <Link
        href="/dashboard"
        className="group flex h-11 shrink-0 items-center gap-1.5 border-b border-slate-100 px-4 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" strokeWidth={2.25} />
        Back to dashboard
      </Link>

      {/* Workspace header */}
      <div className="border-b border-slate-100 px-3 py-3">
        <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-2.5 py-2">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-md object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-900 text-sm font-semibold text-white">
              {initial}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-slate-900">
              {tournamentName}
            </p>
            <span
              className={cn(
                'mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                roleClass,
              )}
            >
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Grouped nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon, exact }) => {
                const url = href(tournamentId)
                const active = exact ? pathname === url : pathname.startsWith(url)
                return (
                  <Link
                    key={url}
                    href={url}
                    className={cn(
                      'flex h-8 items-center gap-2.5 rounded-md px-2 text-sm transition-colors',
                      active
                        ? 'bg-slate-100 font-medium text-slate-900'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    )}
                  >
                    <Icon
                      className={cn('h-4 w-4 shrink-0', active ? 'text-slate-900' : 'text-slate-400')}
                      strokeWidth={active ? 2.25 : 2}
                    />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
