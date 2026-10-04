import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Github } from 'lucide-react'
import { GITHUB_REPOSITORY_URL } from '@/components/marketing/urls'
import { LandingContent } from '@/components/marketing/landing-content'

const workflow = [
  {
    number: '01',
    title: 'Register',
  },
  {
    number: '02',
    title: 'Coordinate',
  },
  {
    number: '03',
    title: 'Reconcile',
  },
  {
    number: '04',
    title: 'Keep a record',
  },
]

export default function MarketingHomePage() {
  return (
    <>
      <Hero />
      <LandingContent />
    </>
  )
}

function Hero() {
  return (
    <section className="bg-[#e9ebee] px-3 pb-3 pt-1 sm:px-5 sm:pb-5">
      <div className="relative mx-auto min-h-[640px] max-w-[1520px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[#fcfcfb] shadow-sm sm:min-h-[700px] xl:min-h-[calc(100svh-7.5rem)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(100,116,139,0.2) 0.8px, transparent 0.9px)',
            backgroundSize: '17px 17px',
            maskImage:
              'radial-gradient(ellipse at center, black 48%, transparent 100%)',
          }}
        />

        <div className="relative z-10 mx-auto flex min-h-[640px] max-w-5xl flex-col items-center justify-center px-6 py-24 text-center sm:min-h-[700px] sm:px-10 xl:min-h-[calc(100svh-7.5rem)]">
          <p className="mb-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-blue-600" />
            Tournament administration
          </p>
          <h1 className="max-w-5xl text-balance text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.065em] text-slate-950 sm:text-6xl lg:text-[5.4rem]">
            Tournament work,
            <span className="block text-slate-400">one clear place.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Registration, institution updates, receipts and approvals in one
            workflow for the team behind the tournament.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-blue-600 px-6 text-[15px] font-medium tracking-tight text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Get started
              <ArrowRight className="ml-1 h-4 w-4" strokeWidth={2.25} />
            </Link>
            <Link
              href={GITHUB_REPOSITORY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-md px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-white/80 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <Github className="h-4 w-4" strokeWidth={2} />
              Explore the repository
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          </div>

          <ol
            id="how-it-works"
            className="mt-9 scroll-mt-32 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:gap-x-7 sm:text-[11px]"
          >
            {workflow.map((item) => (
              <li key={item.number} className="flex items-center gap-2">
                <span className="font-mono text-blue-700">{item.number}</span>
                {item.title}
              </li>
            ))}
          </ol>
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
          <div className="absolute left-[5%] top-[9%] w-56 -rotate-3 rounded-sm bg-[#fff0a8] px-5 pb-5 pt-6 shadow-[0_12px_28px_rgba(15,23,42,0.10)]">
            <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white bg-rose-500 shadow-sm" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-900/70">
              Field note
            </p>
            <p className="mt-3 text-[17px] font-medium italic leading-6 tracking-tight text-slate-800">
              Keep the details out of a dozen different places.
            </p>
          </div>

          <div className="absolute right-[5%] top-[11%] w-52 rotate-3 rounded-xl border border-slate-200 bg-white/95 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.10)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
              On the organizer&apos;s list
            </p>
            <div className="mt-4 space-y-3 text-sm font-medium text-slate-800">
              <p className="border-b border-slate-100 pb-2">Roster checks</p>
              <p className="border-b border-slate-100 pb-2">Receipt review</p>
              <p>Requests and approvals</p>
            </div>
          </div>

          <div className="absolute bottom-[8%] left-[7%] w-56 rotate-2 rounded-xl border border-slate-200 bg-white/95 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.10)]">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
              Registration files
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-900">
              CSV
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Map&nbsp;&nbsp;·&nbsp;&nbsp;Review&nbsp;&nbsp;·&nbsp;&nbsp;Reuse
            </p>
          </div>

          <div className="absolute bottom-[9%] right-[6%] w-56 -rotate-2 rounded-sm bg-[#e6efff] p-5 shadow-[0_12px_28px_rgba(15,23,42,0.09)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
              Keep the work connected
            </p>
            <p className="mt-3 text-lg font-medium leading-6 tracking-tight text-slate-800">
              Changes, decisions and records in view.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
