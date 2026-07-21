'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Trophy,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { logoutAction } from '@/features/auth/actions'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/organization', label: 'Organizations', icon: Building2 },
  { href: '/tournaments', label: 'Tournaments', icon: Trophy },
]

export function DashboardSidebar({
  email,
  displayName,
}: {
  email: string
  displayName: string | null
}) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <aside
      className={`relative flex h-screen flex-col border-r border-slate-200 bg-white transition-[width] duration-200 ease-in-out ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-slate-100 px-4">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-700 text-xs font-bold text-white">
            D
          </div>
          {!collapsed && (
            <span className="truncate text-[15px] font-semibold tracking-tight text-slate-900">
              Debately
            </span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex h-9 items-center gap-3 rounded-md px-2.5 text-sm transition-colors ${
                active
                  ? 'bg-slate-100 font-medium text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.25 : 2} />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: user + sign out */}
      <div className="border-t border-slate-100 p-2">
        <Link
          href="/account"
          title={collapsed ? 'Account' : undefined}
          className="flex h-9 items-center gap-3 rounded-md px-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <User className="h-4 w-4 shrink-0" strokeWidth={2} />
          {!collapsed && (
            <span className="truncate">{displayName ?? email}</span>
          )}
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            title={collapsed ? 'Sign out' : undefined}
            className="flex h-9 w-full items-center gap-3 rounded-md px-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </form>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-[52px] flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-600"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
        )}
      </button>
    </aside>
  )
}
