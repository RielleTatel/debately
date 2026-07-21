import Link from 'next/link'
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  FileSpreadsheet,
  Github,
  Heart,
  History,
  Link2,
  MessageSquareText,
  Receipt,
  Server,
  Sparkles,
  Wallet,
  XCircle,
} from 'lucide-react'

// TODO: replace with the real GitHub URL once the repo is public.
const GITHUB_URL = '#'
import { Button } from '@/components/ui/button'
import { DashboardPreview } from '@/components/marketing/bracket-preview'
import { MappingPreview } from '@/components/marketing/logo-marks'
import { PortalPreview } from '@/components/marketing/portal-preview'

export default function MarketingHomePage() {
  return (
    <>
      <Hero />
      <ProblemBand />
      <FeatureBento />
      <ImportDeepDive />
      <PortalDeepDive />
      <TabbycatBand />
      <HowItWorks />
      <Testimonial />
      <OpenSource />
      <FinalCTA />
    </>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 0%, rgba(29,78,216,0.08), transparent 45%), radial-gradient(circle at 85% 30%, rgba(29,78,216,0.05), transparent 55%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage:
            'radial-gradient(ellipse at top, black 30%, transparent 70%)',
        }}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 pt-20 pb-24 lg:grid-cols-12 lg:gap-12 lg:px-8">
        <div className="lg:col-span-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
            Free and open source · MIT licensed
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl lg:text-6xl lg:leading-[1.05]">
            The administrative backbone for debate tournaments.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Registration, institution portals, finance, and audit trails in one
            place — free to use, free to self-host, built in the open so the
            debate community owns it.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/register">
              <Button
                size="lg"
                className="h-12 bg-blue-700 px-6 text-[15px] text-white hover:bg-blue-800"
              >
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2.25} />
              </Button>
            </Link>
            <Link href={GITHUB_URL} target="_blank" rel="noreferrer">
              <Button
                variant="ghost"
                size="lg"
                className="h-12 px-5 text-[15px] text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                <Github className="mr-2 h-4 w-4" strokeWidth={2} />
                Star on GitHub
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative lg:col-span-6">
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-tr from-blue-100/60 via-transparent to-transparent blur-2xl"
          />
          <DashboardPreview />
        </div>
      </div>
    </section>
  )
}

function ProblemBand() {
  const items = [
    {
      title: 'Registration in Google Sheets',
      body: 'Freeform names, duplicate institutions, no validation. Data quality collapses by Phase 2.',
    },
    {
      title: 'Receipts in email threads',
      body: 'Screenshots buried in inboxes, no reconciliation, no way to prove who approved what.',
    },
    {
      title: 'Announcements in WhatsApp',
      body: 'Messages missed, requests untracked, and no audit trail when disputes surface.',
    },
  ]

  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Tournament ops shouldn&rsquo;t live in ten different tools.
          </h2>
          <p className="mt-4 text-slate-600">
            Most directors juggle Google Forms, spreadsheets, email, and group
            chats. Debately replaces that with one auditable workflow.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                <XCircle className="h-4 w-4" strokeWidth={2} />
              </div>
              <h3 className="mt-4 text-base font-semibold tracking-tight text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureBento() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-700">
            The platform
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Everything the tab room already needed.
          </h2>
          <p className="mt-4 text-slate-600">
            Purpose-built for organizers running British Parliamentary, Asian
            Parliamentary, World Schools, and custom formats.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-6">
          <FeatureCard
            className="md:col-span-4"
            icon={<FileSpreadsheet className="h-5 w-5" />}
            title="CSV import with column mapping"
            body="Upload any Google Form export. Map columns to system fields, save the mapping as a reusable template, and finalize when the summary looks right."
            preview={
              <div className="mt-6 flex flex-wrap gap-1.5">
                {[
                  'Phase 1 · Intent',
                  'Phase 2 · Registration',
                  'Phase 3 · Corrections',
                  'Repeating groups',
                  'Fuzzy institution match',
                ].map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            }
          />
          <FeatureCard
            className="md:col-span-2"
            icon={<Link2 className="h-5 w-5" />}
            title="Institution portals"
            body="Every school gets a private, tokenized URL. They claim it, manage rosters, and upload receipts."
          />

          <FeatureCard
            className="md:col-span-2"
            icon={<Wallet className="h-5 w-5" />}
            title="Finance tracking"
            body="Auto-generated invoices, receipt uploads, and outstanding balance reconciliation — without a payment gateway."
          />
          <FeatureCard
            className="md:col-span-2"
            icon={<ClipboardCheck className="h-5 w-5" />}
            title="Requests workflow"
            body="Every roster change, name correction, and eligibility dispute becomes an auditable, approvable request."
          />
          <FeatureCard
            className="md:col-span-2"
            icon={<History className="h-5 w-5" />}
            title="Immutable activity log"
            body="Every approval, override, and edit is recorded with a before-and-after snapshot. Filterable, exportable, tamper-proof."
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  icon,
  title,
  body,
  preview,
  className = '',
}: {
  icon: React.ReactNode
  title: string
  body: string
  preview?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`group relative flex flex-col rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-slate-300 ${className}`}
    >
      <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
      {preview}
    </div>
  )
}

function ImportDeepDive() {
  const bullets = [
    'Save mappings as templates and reuse them across tournaments',
    'Fuzzy-match institution names so "SPC" and "San Pedro College" merge',
    'Side-by-side diff review when Phase 3 corrections land',
  ]
  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Import the messy CSV. Keep the clean data.
          </h2>
          <p className="mt-4 max-w-lg text-slate-600">
            Your Google Form headers change every year. Debately parses whatever
            you upload, lets you map it to system fields, and remembers the
            mapping so next time is one click.
          </p>
          <ul className="mt-8 space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-blue-700"
                  strokeWidth={2}
                />
                <span className="text-sm leading-relaxed text-slate-700">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-blue-100/60 via-transparent to-transparent blur-2xl"
          />
          <MappingPreview />
        </div>
      </div>
    </section>
  )
}

function PortalDeepDive() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="order-2 lg:order-1">
          <PortalPreview />
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            One private link per institution.
          </h2>
          <p className="mt-4 max-w-lg text-slate-600">
            Every school you import gets a secure onboarding URL. They claim it,
            verify their roster, upload receipts, and see announcements &mdash;
            all scoped to their institution.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {[
              'Tokenized URLs',
              'Roster verification',
              'Receipt uploads',
              'Targeted announcements',
              'In-portal requests',
            ].map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function TabbycatBand() {
  const does = [
    'Registration & institution portals',
    'Finance tracking & receipt verification',
    'Announcements & audit trail',
    'Requests & approvals',
    'CSV exports & analytics',
  ]
  const doesnt = [
    'Pairings & bracket generation',
    'Ballot entry & speaker scoring',
    'Judge allocation & motion release',
    'Team rankings',
  ]

  return (
    <section
      id="tabbycat"
      className="border-b border-slate-200 bg-blue-50/50"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Runs alongside your tab software.
          </h2>
          <p className="mt-4 text-slate-600">
            Debately handles administration &mdash; not adjudication. Keep using
            Tabbycat (or whatever you tab with) for the rounds themselves.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-blue-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-700 text-white">
                <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} />
              </div>
              <h3 className="text-base font-semibold tracking-tight text-slate-900">
                What Debately does
              </h3>
            </div>
            <ul className="mt-4 space-y-2.5">
              {does.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-700" />
                  <span className="text-sm text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                <XCircle className="h-4 w-4" strokeWidth={2.25} />
              </div>
              <h3 className="text-base font-semibold tracking-tight text-slate-900">
                What stays with Tabbycat
              </h3>
            </div>
            <ul className="mt-4 space-y-2.5">
              {doesnt.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                  <span className="text-sm text-slate-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      icon: <FileSpreadsheet className="h-5 w-5" />,
      title: 'Import',
      body: 'Upload CSVs from every registration phase. Map columns, save the template, review the diff.',
    },
    {
      icon: <Link2 className="h-5 w-5" />,
      title: 'Portal',
      body: 'Every imported institution gets a private URL. Share it once, they take it from there.',
    },
    {
      icon: <Receipt className="h-5 w-5" />,
      title: 'Reconcile',
      body: 'Approve receipts, resolve requests, and publish announcements from one queue.',
    },
    {
      icon: <Bell className="h-5 w-5" />,
      title: 'Export',
      body: 'Analytics, CSV exports, and a filterable activity log ready before the closing ceremony.',
    },
  ]

  return (
    <section
      id="how-it-works"
      className="border-b border-slate-200 bg-white"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            From messy spreadsheets to closing ceremony &mdash; in four beats.
          </h2>
        </div>

        <ol className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="relative rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="flex items-center gap-3">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  {step.icon}
                </div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                  Step {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Testimonial() {
  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-24 text-center lg:px-8">
        <MessageSquareText
          className="mx-auto h-8 w-8 text-blue-700"
          strokeWidth={1.75}
        />
        <figure className="mt-8">
          <blockquote className="text-2xl font-medium leading-relaxed tracking-tight text-slate-900 md:text-3xl md:leading-[1.35]">
            &ldquo;Our 42-school invitational used to eat two coaches for a week
            of pre-tournament ops. This year one of us handled it in an
            afternoon, and every approval was auditable.&rdquo;
          </blockquote>
          <figcaption className="mt-8 flex flex-col items-center gap-1">
            <span className="text-sm font-medium text-slate-900">
              Priya Anand
            </span>
            <span className="text-sm text-slate-500">
              Tournament Director, Ateneo Debate Society
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

function OpenSource() {
  const options = [
    {
      icon: <Heart className="h-5 w-5" strokeWidth={2} />,
      name: 'Hosted, free forever',
      description:
        'The fastest path. We run the servers, you run tournaments. No card, no seat limits, no upgrade prompts.',
      features: [
        'Unlimited tournaments & institutions',
        'CSV import with saved mapping templates',
        'Institution portals, finance, and activity log',
        'Community support on GitHub Discussions',
      ],
      cta: { label: 'Get started free', href: '/register', primary: true, external: false },
    },
    {
      icon: <Server className="h-5 w-5" strokeWidth={2} />,
      name: 'Self-host',
      description:
        'Fork the repo and run Debately on your own infrastructure. MIT licensed — use it, modify it, ship it.',
      features: [
        'Full source on GitHub, MIT licensed',
        'Docker Compose for one-command local runs',
        'Bring your own Supabase / Postgres',
        'PRs, issues, and roadmap discussion welcome',
      ],
      cta: { label: 'View on GitHub', href: GITHUB_URL, primary: false, external: true },
    },
  ]

  return (
    <section id="open-source" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-700">
            Open source
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Free to use. Free to fork.
          </h2>
          <p className="mt-4 text-slate-600">
            Debately is built in the open under the MIT license. Use the hosted
            version at no cost, or run your own copy on your own infrastructure.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          {options.map((opt) => (
            <div
              key={opt.name}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                opt.cta.primary
                  ? 'border-blue-700 bg-gradient-to-b from-blue-50/60 to-white shadow-lg shadow-blue-950/10'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                {opt.icon}
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                {opt.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {opt.description}
              </p>
              <ul className="mt-6 space-y-2.5">
                {opt.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-blue-700"
                      strokeWidth={2.25}
                    />
                    <span className="text-sm text-slate-700">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href={opt.cta.href}
                  {...(opt.cta.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  <Button
                    className={`w-full ${
                      opt.cta.primary
                        ? 'bg-blue-700 text-white hover:bg-blue-800'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {opt.cta.external && (
                      <Github className="mr-2 h-4 w-4" strokeWidth={2} />
                    )}
                    {opt.cta.label}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-xl text-center text-sm text-slate-500">
          Built by the debate community, for the debate community. Every
          approval, override, and mapping template is code you can read.
        </p>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-slate-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 50% 100%, rgba(29,78,216,0.14), transparent 60%)',
        }}
      />
      <div className="mx-auto max-w-4xl px-6 py-24 text-center lg:px-8">
        <h2 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
          Give your tab room its week back.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-600">
          Free, open source, and set up in under ten minutes. No card, no seat
          limits — just software the debate community owns.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register">
            <Button
              size="lg"
              className="h-12 bg-blue-700 px-6 text-[15px] text-white hover:bg-blue-800"
            >
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2.25} />
            </Button>
          </Link>
          <Link href={GITHUB_URL} target="_blank" rel="noreferrer">
            <Button
              variant="ghost"
              size="lg"
              className="h-12 px-5 text-[15px] text-slate-700 hover:bg-white hover:text-slate-900"
            >
              <Github className="mr-2 h-4 w-4" strokeWidth={2} />
              Star on GitHub
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
