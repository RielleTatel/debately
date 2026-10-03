import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Github } from 'lucide-react'
import { GITHUB_REPOSITORY_URL } from '@/components/marketing/urls'

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

const features = [
  {
    index: '01',
    title: 'Registration imports',
    description:
      'Map CSV columns to tournament fields, review the imported data, and save mappings for future uploads.',
  },
  {
    index: '02',
    title: 'Institution portals',
    description:
      'Give each school a private place to verify rosters, upload receipts and send requests.',
  },
  {
    index: '03',
    title: 'Finance tracking',
    description:
      'Keep invoices, receipt review and outstanding balances together for the organizing team.',
  },
  {
    index: '04',
    title: 'Requests and activity',
    description:
      'Review roster changes and eligibility questions, then trace updates in the activity log.',
  },
]

const importActions = [
  {
    number: '01',
    title: 'Map',
    description: 'Match the headers in your file to the fields Debately uses.',
  },
  {
    number: '02',
    title: 'Review',
    description: 'Check the incoming information before applying the changes.',
  },
  {
    number: '03',
    title: 'Reuse',
    description: 'Save a mapping template for the next registration phase.',
  },
]

const portalTasks = [
  'Check and update team rosters',
  'Upload receipts for review',
  'Send changes and eligibility requests',
  'Read tournament announcements',
]

const debatelyHandles = [
  'Registration and institution details',
  'Receipts, balances and requests',
  'Announcements and activity records',
]

const tabSoftwareHandles = [
  'Pairings and bracket generation',
  'Ballot entry and speaker scoring',
  'Judge allocation and motion release',
]

export default function MarketingHomePage() {
  return (
    <>
      <Hero />
      <FeatureOverview />
      <ImportSection />
      <InstitutionSection />
      <TabbycatBoundary />
      <RepositorySection />
      <FinalCTA />
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

function FeatureOverview() {
  return (
    <section id="features" className="scroll-mt-24 border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-8 lg:py-24">
        <div className="max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
            The organizing layer
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl">
            The work around the rounds deserves a system of its own.
          </h2>
          <p className="mt-5 leading-7 text-slate-600">
            Bring the details organizers handle before, between and after
            rounds into a shared place.
          </p>
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {features.map((feature) => (
            <article
              key={feature.index}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 py-6 sm:grid-cols-[3rem_minmax(10rem,0.8fr)_1.2fr] sm:gap-x-5 sm:py-7"
            >
              <span className="pt-1 font-mono text-xs text-blue-700">
                {feature.index}
              </span>
              <h3 className="text-lg font-medium tracking-tight text-slate-900">
                {feature.title}
              </h3>
              <p className="col-start-2 mt-2 text-sm leading-6 text-slate-600 sm:col-start-auto sm:mt-0">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ImportSection() {
  return (
    <section className="border-b border-slate-200 bg-[#f3f6fc]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
              Registration data
            </p>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Work with the CSV you have.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Match incoming columns to tournament fields, check the imported
            information, and keep a mapping template for the next phase.
          </p>
        </div>

        <ol className="mt-14 grid grid-cols-1 border-y border-slate-300 sm:grid-cols-3">
          {importActions.map((action, index) => (
            <li
              key={action.number}
              className={`py-6 sm:py-7 ${index > 0 ? 'border-t border-slate-300 sm:border-l sm:border-t-0 sm:pl-7' : ''} ${index < importActions.length - 1 ? 'sm:pr-7' : ''}`}
            >
              <span className="font-mono text-xs text-blue-700">
                {action.number}
              </span>
              <h3 className="mt-5 text-xl font-medium tracking-tight text-slate-900">
                {action.title}
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
                {action.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function InstitutionSection() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 lg:grid-cols-[1fr_1fr] lg:gap-24 lg:px-8 lg:py-24">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
            Institution portals
          </p>
          <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl">
            One place for each school to keep things up to date.
          </h2>
          <p className="mt-5 max-w-lg leading-7 text-slate-600">
            Give institutions a private portal for the details and follow-up
            that would otherwise scatter across messages and files.
          </p>
        </div>

        <ul className="grid grid-cols-1 content-center divide-y divide-slate-200 border-y border-slate-200 sm:grid-cols-2 sm:divide-y-0">
          {portalTasks.map((task, index) => (
            <li
              key={task}
              className={`py-5 text-base font-medium leading-6 text-slate-800 ${index % 2 === 1 ? 'sm:border-l sm:border-slate-200 sm:pl-6' : 'sm:pr-6'} ${index > 1 ? 'sm:border-t sm:border-slate-200' : ''}`}
            >
              <span className="mb-3 block font-mono text-[11px] text-blue-700">
                0{index + 1}
              </span>
              {task}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function TabbycatBoundary() {
  return (
    <section
      id="tabbycat"
      className="scroll-mt-24 border-b border-blue-200 bg-blue-50/70"
    >
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
              A clear division of work
            </p>
            <h2 className="mt-4 max-w-lg text-3xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Administration here. The rounds stay with your tab software.
            </h2>
            <p className="mt-5 max-w-lg leading-7 text-slate-600">
              Debately is designed to sit alongside Tabbycat or the tab system
              your tournament already uses.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
            <ScopeList title="Debately handles" items={debatelyHandles} />
            <ScopeList title="Your tab software handles" items={tabSoftwareHandles} />
          </div>
        </div>
      </div>
    </section>
  )
}

function ScopeList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border-t border-blue-200 pt-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="text-sm leading-6 text-slate-700">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function RepositorySection() {
  return (
    <section
      id="open-source"
      className="scroll-mt-24 border-b border-slate-200 bg-[#fbfaf8]"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-6 py-16 lg:grid-cols-[1fr_auto] lg:px-8 lg:py-20">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
            The project
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl">
            See how Debately is put together.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Browse the repository to review the code and follow the project as
            it develops.
          </p>
        </div>
        <Link
          href={GITHUB_REPOSITORY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <Github className="h-4 w-4" strokeWidth={2} />
          Visit the repository
          <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
        </Link>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-7 px-6 py-20 sm:flex-row sm:items-end sm:justify-between lg:px-8 lg:py-24">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
            Ready for the next tournament?
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Give the organizing team a clearer way to work.
          </h2>
        </div>
        <Link
          href="/register"
          className="inline-flex h-12 w-fit shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-blue-700 px-6 text-[15px] font-medium tracking-tight text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          Get started
          <ArrowRight className="ml-1 h-4 w-4" strokeWidth={2.25} />
        </Link>
      </div>
    </section>
  )
}
