import { AlertCircle, CheckCircle2, Clock, FileSpreadsheet, Users } from 'lucide-react'

export function DashboardPreview() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-blue-950/10">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Tournament
          </div>
          <div className="mt-0.5 truncate text-sm font-semibold text-slate-900">
            Fall Invitational 2026
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-600/10">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <StatTile
          icon={<Users className="h-3.5 w-3.5" />}
          label="Institutions"
          value="24"
          hint="18 claimed"
        />
        <StatTile
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          label="Teams"
          value="86 / 96"
          hint="Complete"
        />
        <StatTile
          icon={<Clock className="h-3.5 w-3.5" />}
          label="Outstanding"
          value="$4,320"
          hint="6 institutions"
        />
        <StatTile
          icon={<AlertCircle className="h-3.5 w-3.5" />}
          label="Pending requests"
          value="12"
          hint="3 urgent"
        />
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
          <FileSpreadsheet className="h-3 w-3" />
          Recent activity
        </div>
        <ul className="mt-2.5 space-y-2">
          <ActivityItem
            actor="Priya A."
            action="approved payment of $560 for De La Salle SHS"
            when="2m ago"
          />
          <ActivityItem
            actor="Marco R."
            action="published announcement 'Day 2 briefing at 8am'"
            when="14m ago"
          />
          <ActivityItem
            actor="System"
            action="Phase 3 import finalized — 12 team updates applied"
            when="1h ago"
          />
        </ul>
      </div>
    </div>
  )
}

function StatTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <span className="text-blue-600">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900 tabular-nums">
        {value}
      </div>
      <div className="text-[11px] text-slate-500">{hint}</div>
    </div>
  )
}

function ActivityItem({
  actor,
  action,
  when,
}: {
  actor: string
  action: string
  when: string
}) {
  return (
    <li className="flex items-start justify-between gap-2 text-[11px] leading-relaxed">
      <span className="text-slate-600">
        <span className="font-medium text-slate-900">{actor}</span> {action}
      </span>
      <span className="shrink-0 font-mono text-[10px] text-slate-400">{when}</span>
    </li>
  )
}
