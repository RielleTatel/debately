import { listRecentActivityForTournament } from '@/features/activity/queries/activity'
import { RecentActivityFeed } from '@/features/dashboards/components/recent-activity-feed'

export async function ActivityPanel({ tournamentId }: { tournamentId: string }) {
  const rows = await listRecentActivityForTournament(tournamentId, 10)
  return <RecentActivityFeed rows={rows} />
}
