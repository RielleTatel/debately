import { getFilledTeamSlots } from '../queries/capacity'

export async function TournamentCapacity({
  tournamentId,
  total,
}: {
  tournamentId: string
  total: number
}) {
  try {
    const filled = await getFilledTeamSlots(tournamentId)
    return (
      <>
        {filled}
        <span className="text-muted-foreground/60">/{total}</span> teams
      </>
    )
  } catch {
    return <>{total} team slots</>
  }
}
