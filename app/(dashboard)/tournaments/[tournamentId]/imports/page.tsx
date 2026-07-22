import { Suspense } from 'react'
import Link from 'next/link'
import { requireTournamentReadable } from '@/features/tournaments/permissions'
import { ROUTES } from '@/lib/constants'
import {
  ImportHistoryPanel,
  ImportHistorySkeleton,
} from '@/features/imports/components/import-history-panel'

export default async function ImportsPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  await requireTournamentReadable(tournamentId)
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Registration imports</h1>
          <p className="text-sm text-muted-foreground">Upload phase-labeled CSVs exported from your registration form.</p>
        </div>
        <Link
          href={ROUTES.imports(tournamentId) + '/new'}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >New import</Link>
      </div>
      <Suspense fallback={<ImportHistorySkeleton />}>
        <ImportHistoryPanel tournamentId={tournamentId} />
      </Suspense>
    </div>
  )
}
