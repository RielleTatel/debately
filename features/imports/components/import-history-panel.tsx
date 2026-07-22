import { getImportsForTournament } from '@/features/imports/queries'
import { prisma } from '@/lib/prisma'
import { ImportHistoryList } from '@/features/imports/components/import-history-list'

export async function ImportHistoryPanel({ tournamentId }: { tournamentId: string }) {
  const imports = await getImportsForTournament(tournamentId)
  const uploaders = imports.length === 0
    ? []
    : await prisma.profile.findMany({
        where: { id: { in: imports.map((i) => i.uploaderId) } },
        select: { id: true, displayName: true },
      })
  const uploaderName = new Map(uploaders.map((u) => [u.id, u.displayName]))
  const items = imports.map((i) => ({
    ...i,
    uploaderName: uploaderName.get(i.uploaderId) ?? null,
  }))
  return <ImportHistoryList tournamentId={tournamentId} imports={items} />
}

export function ImportHistorySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded bg-muted h-14 w-full" />
      ))}
    </div>
  )
}
