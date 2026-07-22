'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { logoutAction } from '@/features/auth/actions'

type Props = {
  email: string
  displayName: string | null
  avatarUrl: string | null
}

export function UserMenu({ email, displayName, avatarUrl }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const name = displayName ?? email
  const initial = name.charAt(0).toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm text-slate-700 transition-colors hover:bg-slate-100"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            {initial}
          </span>
        )}
        <span className="hidden max-w-[140px] truncate sm:inline">{name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-60 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg shadow-slate-900/[0.06]">
          <div className="border-b border-slate-100 px-3 py-2.5">
            <p className="truncate text-sm font-medium text-slate-900">{displayName ?? 'User'}</p>
            <p className="truncate text-xs text-slate-500">{email}</p>
          </div>
          <div className="p-1">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-100"
            >
              <User className="h-4 w-4 text-slate-500" strokeWidth={2} />
              Account
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 text-slate-500" strokeWidth={2} />
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
