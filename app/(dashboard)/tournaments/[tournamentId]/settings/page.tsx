import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getTournamentContext,
  getDirectorsForTournament,
  listEligibleDirectorCandidates,
  getScheduleEntries,
} from '@/features/tournaments/queries'
import { isAppError } from '@/lib/errors'
import { TournamentBasicSettingsForm } from '@/features/tournaments/components/tournament-basic-settings-form'
import { TournamentRegistrationSettingsForm } from '@/features/tournaments/components/tournament-registration-settings-form'
import { TournamentFinanceSettingsForm } from '@/features/tournaments/components/tournament-finance-settings-form'
import { TournamentPortalSettingsForm } from '@/features/tournaments/components/tournament-portal-settings-form'
import { TournamentFormatSettingsForm } from '@/features/tournaments/components/tournament-format-settings-form'
import { TournamentLogoUploader } from '@/features/tournaments/components/tournament-logo-uploader'
import { TournamentRulesUploader } from '@/features/tournaments/components/tournament-rules-uploader'
import { TournamentDirectorsPanel } from '@/features/tournaments/components/tournament-directors-panel'
import { TournamentSchedulePanel } from '@/features/tournaments/components/tournament-schedule-panel'
import { ArchiveTournamentForm } from '@/features/tournaments/components/archive-tournament-form'

type Props = { params: Promise<{ tournamentId: string }> }

export default async function TournamentSettingsPage({ params }: Props) {
  const { tournamentId } = await params
  let ctx
  try {
    ctx = await getTournamentContext(tournamentId)
  } catch (e) {
    if (isAppError(e) && (e.code === 'NOT_FOUND' || e.code === 'FORBIDDEN')) notFound()
    throw e
  }
  const { tournament, role, isDirector } = ctx
  if (!isDirector) notFound()

  const readOnly = tournament.status === 'COMPLETED' || tournament.status === 'ARCHIVED'
  const isOwner = role === 'OWNER'

  const [directors, candidates, schedule] = await Promise.all([
    getDirectorsForTournament(tournament.id),
    listEligibleDirectorCandidates(tournament.id),
    getScheduleEntries(tournament.id),
  ])

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">{tournament.name} — Settings</h1>
        {readOnly && (
          <p className="mt-2 text-sm text-amber-900">
            This tournament is {tournament.status.toLowerCase()} and is read-only. Changes are disabled.
          </p>
        )}
      </div>

      <Panel title="Basic information">
        <TournamentBasicSettingsForm tournament={tournament} readOnly={readOnly} />
      </Panel>

      <Panel title="Logo">
        <TournamentLogoUploader tournamentId={tournament.id} currentUrl={tournament.logoUrl} readOnly={readOnly} />
      </Panel>

      <Panel title="Registration">
        <TournamentRegistrationSettingsForm tournament={tournament} readOnly={readOnly} />
        <div className="border-t pt-4">
          <Link
            href={`/tournaments/${tournament.id}/settings/registration-sources`}
            className="text-sm underline"
          >
            Manage registration sheet sources
          </Link>
        </div>
      </Panel>

      <Panel title="Finance">
        <TournamentFinanceSettingsForm tournament={tournament} readOnly={readOnly} />
      </Panel>

      <Panel title="Portal">
        <TournamentPortalSettingsForm tournament={tournament} readOnly={readOnly} />
      </Panel>

      <Panel title="Format and rules">
        <TournamentFormatSettingsForm tournament={tournament} readOnly={readOnly} />
        <div className="pt-4 border-t">
          <TournamentRulesUploader tournamentId={tournament.id} currentUrl={tournament.rulesUrl} readOnly={readOnly} />
        </div>
      </Panel>

      <Panel title="Schedule">
        <TournamentSchedulePanel tournamentId={tournament.id} entries={schedule} readOnly={readOnly} />
      </Panel>

      <Panel title="Directors">
        <TournamentDirectorsPanel
          tournamentId={tournament.id}
          directors={directors.map((d) => ({
            id: d.id, profileId: d.profileId, displayName: d.profile.displayName, avatarUrl: d.profile.avatarUrl,
          }))}
          candidates={candidates}
          isOwner={isOwner}
        />
      </Panel>

      <Panel title="Danger zone">
        <ArchiveTournamentForm tournament={tournament} isOwner={isOwner} />
      </Panel>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="rounded-md border p-4 space-y-4">{children}</div>
    </section>
  )
}
