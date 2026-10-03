import Link from 'next/link'
import { requireImportEditor } from '@/features/imports/permissions'
import { buildImportPreview } from '@/features/imports/services/build-preview'
import { notFound } from 'next/navigation'
import { PageNavigation } from '@/components/ui/page-navigation'
import type { SearchParams } from '@/lib/pagination'
import { NormalizationPromptCard } from '@/features/imports/components/normalization-prompt'
import { DiffReviewPanel } from '@/features/imports/components/diff-review-panel'
import { FinalizeImportButton } from '@/features/imports/components/finalize-button'
import { ROUTES } from '@/lib/constants'

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ tournamentId: string; importId: string }>
  searchParams: Promise<SearchParams>
}) {
  const { tournamentId, importId } = await params
  const { tournamentId: tid } = await requireImportEditor(importId)
  if (tid !== tournamentId) notFound()
  const search = await searchParams
  const preview = await buildImportPreview(importId, search)

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
            <NormalizationPromptCard key={p.rawName} importId={importId} prompt={p} />
          ))}
        </section>
      )}

      {preview.teamDiffs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Re-submitted teams</h2>
          {preview.teamDiffs.map((d, i) => (
            <DiffReviewPanel
              key={`${d.existingTeamId}-${d.rowIndex}-${i}`}
              importId={importId}
              rowIndex={d.rowIndex}
              diff={d}
            />
          ))}
        </section>
      )}

      <section className="space-y-2 rounded-lg border p-4 text-sm">
        <p>
          <strong>Errors:</strong> {preview.errors} — will be skipped on finalize.
        </p>
        <p>
          <strong>Warnings:</strong> {preview.warnings} — will be imported with a flag.
        </p>
      </section>

      <PageNavigation
        pathname={`/tournaments/${tournamentId}/imports/${importId}/review`}
        params={search}
        paging={preview.paging}
        total={preview.total}
      />
      <div className="flex justify-end gap-2">
        <Link
          href={ROUTES.imports(tournamentId) + '/' + importId + '/mapping'}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          Back to mapping
        </Link>
        <FinalizeImportButton tournamentId={tournamentId} importId={importId} />
      </div>
    </div>
  )
}
