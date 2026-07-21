import { TeamValidationBadges } from './team-validation-badge'
import type { Team, TeamValidationFlag } from '@prisma/client'

type Row = Team & { validationFlags: TeamValidationFlag[]; participantCount: number }

export function TeamList({ teams }: { teams: Row[] }) {
  if (teams.length === 0) return <p className="text-sm text-muted-foreground">No teams yet.</p>
  return (
    <ul className="divide-y rounded-lg border">
      {teams.map((t) => (
        <li key={t.id} className="flex items-center justify-between gap-4 p-3">
          <div className="min-w-0">
            <p className="truncate font-medium">{t.name} {t.isNovice && <span className="text-xs text-muted-foreground">(Novice)</span>}</p>
            <p className="text-xs text-muted-foreground">{t.participantCount} speaker(s)</p>
          </div>
          <TeamValidationBadges flags={t.validationFlags} />
        </li>
      ))}
    </ul>
  )
}
