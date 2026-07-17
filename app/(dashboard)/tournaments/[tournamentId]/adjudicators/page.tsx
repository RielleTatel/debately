type Params = Promise<{ tournamentId: string }>

export default async function AdjudicatorsPage({ params }: { params: Params }) {
  const { tournamentId } = await params
  return <h1 className="text-2xl font-bold">Adjudicators</h1>
}
