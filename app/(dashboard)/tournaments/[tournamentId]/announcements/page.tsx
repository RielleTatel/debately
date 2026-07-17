type Params = Promise<{ tournamentId: string }>

export default async function AnnouncementsPage({ params }: { params: Params }) {
  const { tournamentId } = await params
  return <h1 className="text-2xl font-bold">Announcements</h1>
}
