import { Suspense } from 'react'
import { requireTournamentDirector } from '@/features/tournaments/permissions'
import { SourcesTable, AddSourceDialog } from '@/features/tournament-sheet-sources/components'

export default async function RegistrationSourcesPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>
}) {
  const { tournamentId } = await params
  await requireTournamentDirector(tournamentId)

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Registration Sources</h1>
          <p className="mt-1 text-sm text-gray-500">
            Connect Google Sheets that back your registration forms. Each phase can have its own sheet.
          </p>
        </div>
        <AddSourceDialog tournamentId={tournamentId} />
      </div>

      <Suspense fallback={<div className="text-sm text-gray-400">Loading…</div>}>
        <SourcesTable tournamentId={tournamentId} />
      </Suspense>
    </div>
  )
}
