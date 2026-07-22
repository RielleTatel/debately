'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User, LogOut, ChevronsUpDown, Settings } from 'lucide-react'
import { logoutAction } from '@/features/auth/actions'
import { cn } from '@/lib/utils'

type Props = {
  email: string
  displayName: string | null
  avatarUrl: string | null
  variant?: 'pill' | 'sidebar'
}

export function UserMenu({ email, displayName, avatarUrl, variant = 'pill' }: Props) {
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
        className={cn(
          'flex w-full items-center gap-2.5 rounded-md text-sm transition-colors',
          variant === 'pill' && 'h-8 px-1.5 hover:bg-foreground/[0.05]',
          variant === 'sidebar' &&
            'h-11 px-2 hover:bg-foreground/[0.05] border border-transparent hover:border-border',
        )}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={26}
            height={26}
            className="h-[26px] w-[26px] shrink-0 rounded-full object-cover ring-1 ring-inset ring-border"
          />
        ) : (
          <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground ring-1 ring-inset ring-primary/40">
            {initial}
          </span>
        )}
        {variant === 'sidebar' ? (
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-[13px] font-medium leading-tight text-foreground">
              {displayName ?? 'Account'}
            </p>
            <p className="truncate text-[11.5px] leading-tight text-muted-foreground">
              {email}
            </p>
          </div>
        ) : (
          <span className="hidden max-w-[140px] truncate text-foreground sm:inline">{name}</span>
        )}
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" strokeWidth={2} />
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-50 w-64 overflow-hidden rounded-lg border border-border bg-popover shadow-pop',
            variant === 'sidebar' ? 'bottom-full mb-1.5 left-0' : 'right-0 top-full mt-1.5',
          )}
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-[13px] font-medium text-foreground">{displayName ?? 'User'}</p>
            <p className="truncate text-[11.5px] text-muted-foreground">{email}</p>
          </div>
          <div className="p-1">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-foreground transition-colors hover:bg-foreground/[0.05]"
            >
              <User className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
              Account
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-foreground transition-colors hover:bg-foreground/[0.05]"
            >
              <Settings className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
              Settings
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-foreground transition-colors hover:bg-destructive/8 hover:text-destructive"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
