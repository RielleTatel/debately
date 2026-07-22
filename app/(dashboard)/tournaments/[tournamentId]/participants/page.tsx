import { requireTournamentReadable } from '@/features/tournaments/permissions'
import { getRegistrationAnalytics } from '@/features/analytics/services/registration'
import { PageHeader } from '@/components/ui/page-header'
import { ActionCard } from '@/components/ui/action-card'
import { MetricCard } from '@/components/ui/metric-card'
import { Building2, Users, UserCheck } from 'lucide-react'

export default async function ParticipantsPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>
}) {
  const { tournamentId } = await params
  await requireTournamentReadable(tournamentId)
  const reg = await getRegistrationAnalytics(tournamentId)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Participants"
        description="Everything about who's coming — institutions, teams, and adjudicators."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Institutions"
          value={reg.counts.institutions}
          icon={<Building2 className="h-3.5 w-3.5" strokeWidth={2} />}
          href={`/tournaments/${tournamentId}/institutions`}
          hint={`${reg.claimBreakdown.claimed} claimed portal`}
        />
        <MetricCard
          label="Teams"
          value={reg.counts.teams}
          icon={<Users className="h-3.5 w-3.5" strokeWidth={2} />}
          href={`/tournaments/${tournamentId}/teams`}
          hint={`of ${reg.capacity.totalSlots} slots`}
        />
        <MetricCard
          label="Adjudicators"
          value={reg.counts.adjudicators}
          icon={<UserCheck className="h-3.5 w-3.5" strokeWidth={2} />}
          href={`/tournaments/${tournamentId}/adjudicators`}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <ActionCard
          title="Manage institutions"
          description="Portal claims, contact info, per-institution teams and judges"
          href={`/tournaments/${tournamentId}/institutions`}
          icon={<Building2 className="h-4 w-4" strokeWidth={2} />}
        />
        <ActionCard
          title="View all teams"
          description="Every team grouped by institution, novice status, and flags"
          href={`/tournaments/${tournamentId}/teams`}
          icon={<Users className="h-4 w-4" strokeWidth={2} />}
        />
        <ActionCard
          title="Adjudicator pool"
          description="Experience levels, availability, and director notes"
          href={`/tournaments/${tournamentId}/adjudicators`}
          icon={<UserCheck className="h-4 w-4" strokeWidth={2} />}
        />
      </div>
    </div>
  )
}
