import { requireTournamentDirector } from '@/features/tournaments/permissions'
import { CsvUploadForm } from '@/features/imports/components/csv-upload-form'

export default async function NewImportPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  await requireTournamentDirector(tournamentId)
  return (
    <div className="mx-auto max-w-xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">New import</h1>
        <p className="text-sm text-muted-foreground">CSV up to 10&nbsp;MB. You&apos;ll map columns next.</p>
      </div>
      <CsvUploadForm tournamentId={tournamentId} />
    </div>
  )
}
