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
    <footer className="border-t border-slate-200/80 bg-[#fcfcfb]">
      <div className="mx-auto w-[calc(100%-2.5rem)] max-w-[1200px] py-14 sm:w-[calc(100%-4rem)] sm:py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-[1.7fr_0.8fr_0.8fr_1fr]">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="flex w-fit items-center gap-2">
              <Logo className="h-7 w-7" size={28} />
              <span className="text-lg font-semibold tracking-tight text-[#15233b]">
                Debately
              </span>
            </Link>
            <p className="mt-4 max-w-[30ch] text-[13px] leading-6 text-slate-500">
              A shared workspace for the people behind the tournament.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-[13px] font-medium text-[#15233b]">
                {column.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={`${column.title}:${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-slate-500 hover:text-blue-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="text-[13px] font-medium text-[#15233b]">
              Project
            </h2>
            <Link
              href={GITHUB_REPOSITORY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-blue-700"
            >
              GitHub repository
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-slate-200/80 pt-6 text-[11px] leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Debately.</p>
          <p>Made for the work before and after round one.</p>
        </div>
      </div>
    </footer>
  )
}
