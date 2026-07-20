import { CheckCircle2, Clock, MessageSquare, Users } from 'lucide-react'

export function PortalPreview() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-blue-950/10">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-950 text-[11px] font-semibold text-white">
            DLSU
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight text-slate-900">
              De La Salle University SHS
            </div>
            <div className="text-[11px] text-slate-500">
              Fall Invitational 2026 · Portal claimed
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
          <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} /> Verified
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <SummaryCell icon={<Users className="h-3 w-3" />} label="Teams" value="4" />
        <SummaryCell icon={<Users className="h-3 w-3" />} label="Speakers" value="12" />
        <SummaryCell icon={<Users className="h-3 w-3" />} label="Judges" value="2" />
      </div>

      <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Balance
          </span>
          <span className="text-[11px] font-medium text-amber-700">Partial</span>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-lg font-semibold tabular-nums text-slate-900">
            $840
          </span>
          <span className="text-[11px] text-slate-500">of $1,400</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-3/5 rounded-full bg-blue-600" />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <FeedRow
          icon={<MessageSquare className="h-3 w-3" />}
          title="Day 2 briefing at 8am"
          meta="Announcement · 14m ago"
          tone="info"
        />
        <FeedRow
          icon={<Clock className="h-3 w-3" />}
          title="Speaker replacement request pending"
          meta="Request #12 · awaiting review"
          tone="warning"
        />
      </div>
    </div>
  )
}

function SummaryCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-2.5">
      <div className="flex items-center gap-1 text-[10px] text-slate-500">
        <span className="text-blue-600">{icon}</span>
        {label}
      </div>
      <div className="mt-0.5 text-base font-semibold tabular-nums text-slate-900">
        {value}
      </div>
    </div>
  )
}

function FeedRow({
  icon,
  title,
  meta,
  tone,
}: {
  icon: React.ReactNode
  title: string
  meta: string
  tone: 'info' | 'warning'
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-slate-100 bg-white p-2.5">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded ${
          tone === 'info' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12px] font-medium text-slate-900">{title}</div>
        <div className="text-[10px] text-slate-500">{meta}</div>
      </div>
    </div>
  )
}
