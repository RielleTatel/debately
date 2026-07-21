import Link from 'next/link'
import { requireTournamentReadable } from '@/features/tournaments/permissions'
import { getImportsForTournament } from '@/features/imports/queries'
import { prisma } from '@/lib/prisma'
import { ROUTES } from '@/lib/constants'
import { ImportHistoryList } from '@/features/imports/components/import-history-list'

export default async function ImportsPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  await requireTournamentReadable(tournamentId)
  const imports = await getImportsForTournament(tournamentId)
  const uploaders = await prisma.profile.findMany({
    where: { id: { in: imports.map((i) => i.uploaderId) } },
    select: { id: true, displayName: true },
  })
  const items = imports.map((i) => ({
    ...i,
    uploaderName: uploaders.find((u) => u.id === i.uploaderId)?.displayName ?? null,
  }))
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
      <ImportHistoryList tournamentId={tournamentId} imports={items} />
    </div>
  )
}
