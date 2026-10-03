import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Logo } from './logo'
import { GITHUB_REPOSITORY_URL } from './urls'

const columns = [
  {
    title: 'Explore',
    links: [
      { href: '/#features', label: 'Features' },
      { href: '/#how-it-works', label: 'How it works' },
      { href: '/#tabbycat', label: 'With Tabbycat' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/login', label: 'Sign in' },
      { href: '/register', label: 'Get started' },
      { href: '/contact', label: 'Contact' },
    ],
  },
] satisfies ReadonlyArray<{
  title: string
  links: ReadonlyArray<{ href: string; label: string }>
}>

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[#fbfaf8]">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="flex w-fit items-center gap-2">
              <Logo className="h-7 w-7" size={28} />
              <span className="text-[15px] font-semibold tracking-tight text-slate-900">
                Debately
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">
              Tournament administration for the people doing the work behind
              the rounds.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                {column.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={`${column.title}:${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 transition-colors hover:text-slate-950"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Project
            </h2>
            <Link
              href={GITHUB_REPOSITORY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-slate-950"
            >
              GitHub repository
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Debately.</p>
          <p>Made for the work before and after round one.</p>
        </div>
      </div>
    </footer>
  )
}
