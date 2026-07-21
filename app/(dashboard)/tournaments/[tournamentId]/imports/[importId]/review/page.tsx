import Link from 'next/link'
import { requireImportEditor } from '@/features/imports/permissions'
import { buildImportPreview } from '@/features/imports/services/build-preview'
import { getInstitutionsForTournament } from '@/features/institutions/queries'
import { Button } from '@/components/ui/button'
import { NormalizationPromptCard } from '@/features/imports/components/normalization-prompt'
import { DiffReviewPanel } from '@/features/imports/components/diff-review-panel'
import { ROUTES } from '@/lib/constants'

export default async function ReviewPage({
  params,
}: { params: Promise<{ tournamentId: string; importId: string }> }) {
  const { tournamentId, importId } = await params
  const { tournamentId: tid } = await requireImportEditor(importId)
  const [preview, institutions] = await Promise.all([
    buildImportPreview(importId),
    getInstitutionsForTournament(tid),
  ])
  const errorRows = preview.rows.filter((r) => r.status === 'ERROR')
  const warningRows = preview.rows.filter((r) => r.status === 'WARNING')
  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Review import</h1>
        <p className="text-sm text-muted-foreground">
          Confirm institution matches and re-submission diffs, then finalize.
        </p>
      </div>

      {preview.normalizationPrompts.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Institution name checks</h2>
          {preview.normalizationPrompts.map((p) => (
            <NormalizationPromptCard key={p.rawName} importId={importId} prompt={p} institutions={institutions} />
          ))}
        </section>
      )}

      {preview.teamDiffs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Re-submitted teams</h2>
          {preview.teamDiffs.map((d, i) => (
            <DiffReviewPanel key={`${d.existingTeamId}-${i}`} importId={importId} rowIndex={i} diff={d} />
          ))}
        </section>
      )}

      <section className="space-y-2 rounded-lg border p-4 text-sm">
        <p><strong>Errors:</strong> {errorRows.length} — will be skipped on finalize.</p>
        <p><strong>Warnings:</strong> {warningRows.length} — will be imported with a flag.</p>
      </section>

      <div className="flex justify-end gap-2">
        <Link
          href={ROUTES.imports(tournamentId) + '/' + importId + '/mapping'}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >Back to mapping</Link>
        <form action={async () => {
          'use server'
          const { finalizeImportAction } = await import('@/features/imports/actions')
          const fd = new FormData(); fd.append('importId', importId)
          await finalizeImportAction(fd)
        }}>
          <Button type="submit">Finalize import</Button>
        </form>
      </div>
    </div>
  )
}
