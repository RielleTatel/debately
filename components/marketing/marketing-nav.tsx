import Link from 'next/link'
import { Github } from 'lucide-react'
import { Logo } from './logo'
import { GITHUB_REPOSITORY_URL } from './urls'

const navLinks = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#tabbycat', label: 'With Tabbycat' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 bg-[#e9ebee] px-3 pb-2 pt-3 sm:px-5 sm:pb-3 sm:pt-5">
      <div className="mx-auto flex h-16 max-w-[1520px] items-center justify-between rounded-[1.25rem] border border-slate-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-7 w-7" size={28} priority />
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            Debately
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
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
            href={GITHUB_REPOSITORY_URL}
            target="_blank"
            rel="noopener noreferrer"
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
          <details className="relative lg:hidden">
            <summary className="flex h-9 cursor-pointer list-none items-center rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 [&::-webkit-details-marker]:hidden">
              Menu
            </summary>
            <div className="absolute right-0 top-11 z-50 w-60 rounded-lg border border-slate-200 bg-white p-2 shadow-lg shadow-slate-900/10">
              <nav aria-label="Mobile navigation" className="grid gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href={GITHUB_REPOSITORY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                >
                  <Github className="h-4 w-4" strokeWidth={2} />
                  GitHub repository
                </Link>
                <div className="mt-1 grid grid-cols-2 gap-2 border-t border-slate-200 pt-2">
                  <Link
                    href="/login"
                    className="rounded-md px-3 py-2.5 text-center text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-md bg-blue-700 px-3 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800"
                  >
                    Get started
                  </Link>
                </div>
              </nav>
            </div>
          </details>
          <Link
            href="/register"
            className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md bg-blue-700 px-3 text-[13px] font-medium tracking-tight text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}
