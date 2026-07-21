import Link from 'next/link'
import type { TournamentInstitution } from '@prisma/client'

type Summary = {
  teamsTotal: number
  teamsWithIssues: number
  participantsTotal: number
  adjudicatorsTotal: number
}

export function InstitutionDashboard({
  institution, summary,
}: {
  institution: TournamentInstitution
  summary: Summary
}) {
  const items: [string, number, string][] = [
    ['Teams', summary.teamsTotal, `/portal/${institution.id}/teams`],
    ['Teams with issues', summary.teamsWithIssues, `/portal/${institution.id}/teams`],
    ['Participants', summary.participantsTotal, `/portal/${institution.id}/participants`],
    ['Adjudicators', summary.adjudicatorsTotal, `/portal/${institution.id}/adjudicators`],
  ]
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([label, value, href]) => (
        <Link key={label} href={href} className="rounded-lg border p-4 transition hover:border-foreground">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-medium">{value}</p>
        </Link>
      ))}
    </div>
  )
}
