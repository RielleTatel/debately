import { requireImportReadable } from '@/features/imports/permissions'
import { buildImportSummary } from '@/features/imports/services/summary'
import { ImportSummaryPanel } from '@/features/imports/components/import-summary'

export default async function SummaryPage({
  params,
}: { params: Promise<{ tournamentId: string; importId: string }> }) {
  const { importId } = await params
  const { import: rec } = await requireImportReadable(importId)
  const partial = await buildImportSummary(importId)
  const persisted = (rec.summaryJson as Partial<typeof partial> | null) ?? {}
  const summary = { ...partial, ...persisted }
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Import summary</h1>
        <p className="text-sm text-muted-foreground">{rec.phaseLabel}</p>
      </div>
      <ImportSummaryPanel importId={importId} summary={summary} />
    </div>
  )
}
