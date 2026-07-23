import Link from 'next/link'
import { listSourcesForTournament } from '../queries'
import { PHASE_LABELS } from '../types'
import { ToggleActiveButton, DeleteButton, EditMappingButton } from './row-actions'
import type { Prisma } from '@prisma/client'

interface Props { tournamentId: string }

export async function SourcesTable({ tournamentId }: Props) {
  const sources = await listSourcesForTournament(tournamentId)

  if (sources.length === 0) {
    return (
      <div className="rounded border border-dashed p-6 text-center text-sm text-gray-500">
        No sheet sources registered yet. Click &quot;Add source&quot; to connect a Google Sheet.
      </div>
    )
  }

  return (
    <table className="w-full text-sm">
      <thead className="text-left text-gray-500">
        <tr>
          <th className="p-2">Phase</th>
          <th className="p-2">Spreadsheet</th>
          <th className="p-2">Tab</th>
          <th className="p-2">Mapping</th>
          <th className="p-2">Active</th>
          <th className="p-2">Last synced</th>
          <th className="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {sources.map((s) => (
          <tr key={s.id} className="border-t">
            <td className="p-2">{PHASE_LABELS[s.phase]}</td>
            <td className="p-2 font-mono text-xs">
              <Link
                href={`https://docs.google.com/spreadsheets/d/${s.spreadsheetId}`}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                {s.spreadsheetId.slice(0, 12)}…
              </Link>
            </td>
            <td className="p-2">{s.sheetTabName ?? <em className="text-gray-400">(default)</em>}</td>
            <td className="p-2">
              {s.columnMapping ? 'Configured' : <span className="text-orange-600">Not set</span>}
            </td>
            <td className="p-2">{s.active ? 'Yes' : 'No'}</td>
            <td className="p-2">
              {s.lastSyncedAt ? new Date(s.lastSyncedAt).toLocaleString() : 'Never'}
              {s.lastSyncError && (
                <div className="text-xs text-red-600 truncate max-w-[200px]" title={s.lastSyncError}>
                  {s.lastSyncError}
                </div>
              )}
            </td>
            <td className="p-2 space-x-2">
              <EditMappingButton
                sourceId={s.id}
                spreadsheetId={s.spreadsheetId}
                sheetTabName={s.sheetTabName}
                currentMapping={s.columnMapping as Record<string, string> | null}
              />
              <ToggleActiveButton sourceId={s.id} active={s.active} hasMapping={!!s.columnMapping} />
              <DeleteButton sourceId={s.id} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
