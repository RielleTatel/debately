export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-widest text-blue-700">
        About Debately
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
        Built by people who ran the tab room.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
        Debately started at a national qualifier where the Phase 3 corrections
        spreadsheet had 14 versions before Saturday morning. We built the
        administrative tool we wished existed that weekend, then shipped it to
        the organizers who ran the next one.
      </p>
    </div>
  )
}
