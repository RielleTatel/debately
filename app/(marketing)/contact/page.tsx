export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-widest text-blue-700">
        Contact
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
        Talk to the team.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
        Sales, support, and partnership questions land in the same inbox.
        We&rsquo;ll get back to you within one business day.
      </p>
      <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <div className="text-sm text-slate-600">Email</div>
        <a
          href="mailto:hello@debately.com"
          className="mt-1 block text-lg font-medium text-slate-900 hover:text-blue-700"
        >
          hello@debately.com
        </a>
      </div>
    </div>
  )
}
