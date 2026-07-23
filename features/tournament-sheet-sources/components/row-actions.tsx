'use client'
import { useTransition, useState } from 'react'
import { toggleActiveAction, deleteSourceAction } from '../actions'
import { ColumnMappingEditor } from './column-mapping-editor'

export function ToggleActiveButton({ sourceId, active, hasMapping }: { sourceId: string; active: boolean; hasMapping: boolean }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <>
      <button
        className="text-xs underline disabled:opacity-50"
        disabled={pending || (!active && !hasMapping)}
        title={!active && !hasMapping ? 'Configure column mapping before activating' : ''}
        onClick={() => start(async () => {
          const fd = new FormData()
          fd.set('sourceId', sourceId)
          fd.set('active', String(!active))
          const r = await toggleActiveAction(fd)
          if (!r.ok) setError(r.error)
        })}
      >
        {active ? 'Deactivate' : 'Activate'}
      </button>
      {error && <div className="text-xs text-red-600">{error}</div>}
    </>
  )
}

export function DeleteButton({ sourceId }: { sourceId: string }) {
  const [pending, start] = useTransition()
  return (
    <button
      className="text-xs text-red-600 underline disabled:opacity-50"
      disabled={pending}
      onClick={() => {
        if (!confirm('Delete this source and all its imported submissions?')) return
        start(async () => {
          const fd = new FormData()
          fd.set('sourceId', sourceId)
          await deleteSourceAction(fd)
        })
      }}
    >
      Delete
    </button>
  )
}

export function EditMappingButton({ sourceId, spreadsheetId, sheetTabName, currentMapping }: {
  sourceId: string
  spreadsheetId: string
  sheetTabName: string | null
  currentMapping: Record<string, string> | null
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="text-xs underline" onClick={() => setOpen(true)}>Mapping</button>
      {open && (
        <ColumnMappingEditor
          sourceId={sourceId}
          spreadsheetId={spreadsheetId}
          sheetTabName={sheetTabName}
          initial={currentMapping ?? {}}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
