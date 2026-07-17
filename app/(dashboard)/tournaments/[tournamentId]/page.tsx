type Params = Promise<{ tournamentId: string }>

export default async function TournamentOverviewPage({ params }: { params: Params }) {
  const { tournamentId } = await params
  return <h1 className="text-2xl font-bold">Tournament {tournamentId}</h1>
}
