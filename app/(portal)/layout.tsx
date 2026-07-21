import type { ReactNode } from 'react'
import Link from 'next/link'

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <Link href="/" className="font-bold text-lg" aria-label="Debately home">Debately</Link>
          <p className="text-xs text-muted-foreground">Institution portal</p>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
