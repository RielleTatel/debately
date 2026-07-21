import Link from 'next/link'
import { requireTournamentReadable } from '@/features/tournaments/permissions'
import { getInstitutionsForTournament } from '@/features/institutions/queries'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'

export default async function InstitutionsPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  await requireTournamentReadable(tournamentId)
  const institutions = await getInstitutionsForTournament(tournamentId)
  const claims = await prisma.institutionClaim.findMany({
    where: { tournamentInstitutionId: { in: institutions.map((i) => i.id) } },
  })
  const claimedSet = new Set(claims.map((c) => c.tournamentInstitutionId))
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Institutions</h1>
      {institutions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No institutions yet. Import a CSV.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {institutions.map((i) => (
            <li key={i.id} className="flex items-center justify-between p-3">
              <div>
                <p className="font-medium">{i.name}</p>
                <p className="text-xs text-muted-foreground">{i.contactEmail ?? 'no contact email'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={claimedSet.has(i.id) ? 'secondary' : 'outline'}>
                  {claimedSet.has(i.id) ? 'Claimed' : 'Unclaimed'}
                </Badge>
                <Link
                  href={`/tournaments/${tournamentId}/institutions/${i.id}`}
                  className="text-sm underline"
                >Manage</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
