import { Badge } from '@/components/ui/badge'
import type { TeamValidationFlag, TeamValidationKind } from '@prisma/client'

const LABEL: Record<TeamValidationKind, string> = {
  INCOMPLETE: 'Incomplete',
  INELIGIBLE_SPEAKER: 'Ineligible speaker',
  MISSING_JUDGE: 'Missing judge',
}

export function TeamValidationBadges({ flags }: { flags: TeamValidationFlag[] }) {
  if (flags.length === 0) return <Badge variant="secondary">OK</Badge>
  return (
    <div className="flex flex-wrap gap-1">
      {flags.map((f) => (
        <Badge key={f.id} variant="destructive" title={f.note}>{LABEL[f.kind]}</Badge>
      ))}
    </div>
  )
}
