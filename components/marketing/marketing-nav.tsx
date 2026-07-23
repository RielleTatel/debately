import Link from 'next/link'
import { Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from './logo'

// TODO: replace with the real GitHub URL once the repo is public.
const GITHUB_URL = '#'

const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/#open-source', label: 'Open source' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-7 w-7" size={28} priority />
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            Debately
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-slate-600 transition-colors hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Debately on GitHub"
            className="hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
          >
            <Github className="h-4 w-4" strokeWidth={2} />
            <span>GitHub</span>
          </Link>
          <Link
            href="/login"
            className="hidden text-sm text-slate-600 transition-colors hover:text-slate-900 sm:inline-flex px-3 py-2"
          >
            Sign in
          </Link>
          <Link href="/register">
            <Button
              size="sm"
              className="bg-blue-700 text-white hover:bg-blue-800"
            >
              Get started free
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
