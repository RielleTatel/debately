'use client'

import { usePathname } from 'next/navigation'
import { NavLink } from '@/components/navigation/nav-link'
import {
  LayoutDashboard,
  Upload,
  Building2,
  Users,
  DollarSign,
  Megaphone,
  MessageSquare,
  Settings,
  Activity,
  BarChart3,
  Download,
} from 'lucide-react'

const links = [
  { href: (id: string) => `/tournaments/${id}`, label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: (id: string) => `/tournaments/${id}/imports`, label: 'Imports', icon: Upload },
  { href: (id: string) => `/tournaments/${id}/institutions`, label: 'Institutions', icon: Building2 },
  { href: (id: string) => `/tournaments/${id}/adjudicators`, label: 'Adjudicators', icon: Users },
  { href: (id: string) => `/tournaments/${id}/finance`, label: 'Finance', icon: DollarSign },
  { href: (id: string) => `/tournaments/${id}/announcements`, label: 'Announcements', icon: Megaphone },
  { href: (id: string) => `/tournaments/${id}/requests`, label: 'Requests', icon: MessageSquare },
  { href: (id: string) => `/tournaments/${id}/activity`, label: 'Activity', icon: Activity },
  { href: (id: string) => `/tournaments/${id}/analytics`, label: 'Analytics', icon: BarChart3 },
  { href: (id: string) => `/tournaments/${id}/exports`, label: 'Exports', icon: Download },
  { href: (id: string) => `/tournaments/${id}/settings`, label: 'Settings', icon: Settings },
]

export function TournamentSubNav({ tournamentId }: { tournamentId: string }) {
  const pathname = usePathname()
  const tournamentBase = `/tournaments/${tournamentId}`

  return (
    <nav className="flex items-center gap-1 border-b bg-muted/30 px-4 py-1.5 overflow-x-auto">
      {links.map(({ href, label, icon: Icon, exact }) => {
        const url = href(tournamentId)
        const active = exact ? pathname === url : pathname.startsWith(url)
        return (
          <NavLink key={url} href={url} className={active ? 'bg-background shadow-sm' : ''}>
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        )
      })}
    </nav>
  )
}
