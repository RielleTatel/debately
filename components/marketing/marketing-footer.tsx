import Link from 'next/link'
import { Logo } from './logo'

// TODO: replace with the real GitHub URL once the repo is public.
const GITHUB_URL = '#'

const columns = [
  {
    title: 'Product',
    links: [
      { href: '/features', label: 'Features' },
      { href: '/#open-source', label: 'Open source' },
      { href: '/#how-it-works', label: 'How it works' },
      { href: '/#tabbycat', label: 'Works with Tabbycat' },
    ],
  },
  {
    title: 'Community',
    links: [
      { href: GITHUB_URL, label: 'GitHub', external: true },
      { href: `${GITHUB_URL}/issues`, label: 'Issues', external: true },
      { href: `${GITHUB_URL}/discussions`, label: 'Discussions', external: true },
      { href: '/about', label: 'About' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/#docs', label: 'Documentation' },
      { href: '/#import-guide', label: 'Self-hosting guide' },
      { href: '/#audit', label: 'Activity log' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: `${GITHUB_URL}/blob/main/LICENSE`, label: 'License (MIT)', external: true },
      { href: '/#privacy', label: 'Privacy' },
      { href: '/#terms', label: 'Terms' },
      { href: '/#security', label: 'Security' },
    ],
  },
] satisfies ReadonlyArray<{
  title: string
  links: ReadonlyArray<{ href: string; label: string; external?: boolean }>
}>

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6 md:gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-7 w-7" size={28} />
              <span className="text-[15px] font-semibold tracking-tight text-slate-900">
                Debately
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
              Free, open source, and built for the debate community — registration,
              finance, and communication in one place.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {col.title}
              </div>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={`${col.title}:${link.label}`}>
                    <Link
                      href={link.href}
                      {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                      className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Debately &middot; MIT licensed &middot; Free forever.
          </p>
          <p className="text-xs text-slate-500">
            Built for the coaches and organizers who make Saturdays happen.
          </p>
        </div>
      </div>
    </footer>
  )
}
