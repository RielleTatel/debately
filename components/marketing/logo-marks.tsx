import { CheckCircle2 } from 'lucide-react'

export function MappingPreview() {
  const rows: Array<{ csv: string; field: string; status: 'mapped' | 'ignore' }> = [
    { csv: 'Institution Name', field: 'institution_name', status: 'mapped' },
    { csv: 'Rep Email', field: 'representative_email', status: 'mapped' },
    { csv: 'Team 1 Name', field: 'team_name  (repeat 1)', status: 'mapped' },
    { csv: 'Speaker 1 Full Name', field: 'debater_name[1]', status: 'mapped' },
    { csv: 'Speaker 2 Full Name', field: 'debater_name[2]', status: 'mapped' },
    { csv: 'Consent Checkbox', field: 'Ignore', status: 'ignore' },
    { csv: 'Facebook URL', field: 'Ignore', status: 'ignore' },
  ]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-blue-950/10">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-medium text-blue-700">
            phase-2.csv
          </span>
          <span className="text-[11px] text-slate-500">42 columns · 118 rows</span>
        </div>
        <span className="text-[11px] font-medium text-blue-700">Template applied</span>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto_1.2fr_auto] items-center gap-x-3 gap-y-2 text-[11px]">
        <div className="text-slate-500">CSV column</div>
        <div />
        <div className="text-slate-500">System field</div>
        <div />

        {rows.map((row) => (
          <RowLine key={row.csv} row={row} />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-[11px] text-slate-500">
          <span className="font-medium text-slate-900">5 mapped</span> ·{' '}
          <span className="text-slate-500">2 ignored</span> · 35 pending
        </span>
        <span className="rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white">
          Continue
        </span>
      </div>
    </div>
  )
}

function RowLine({
  row,
}: {
  row: { csv: string; field: string; status: 'mapped' | 'ignore' }
}) {
  return (
    <>
      <div className="truncate rounded-md border border-slate-100 bg-slate-50/60 px-2.5 py-1.5 font-mono text-[11px] text-slate-700">
        {row.csv}
      </div>
      <div className="text-slate-300">→</div>
      <div
        className={`truncate rounded-md border px-2.5 py-1.5 font-mono text-[11px] ${
          row.status === 'mapped'
            ? 'border-blue-100 bg-blue-50/70 text-blue-800'
            : 'border-slate-100 bg-white text-slate-400'
        }`}
      >
        {row.field}
      </div>
      <div>
        {row.status === 'mapped' ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2.25} />
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </div>
    </>
  )
}
