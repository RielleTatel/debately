import { requireInstitutionRep } from '@/features/portal/permissions'
import { listAnnouncementsForInstitution } from '@/features/announcements/queries'

export default async function PortalAnnouncementsPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const { institutionId } = await params
  await requireInstitutionRep(institutionId)
  const list = await listAnnouncementsForInstitution(institutionId)

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-semibold">Announcements</h1>
      <ul className="divide-y rounded-md border">
        {list.length === 0 && <li className="p-4 text-sm text-muted-foreground">No announcements yet.</li>}
        {list.map((a) => (
          <li key={a.id} className="p-3 space-y-2">
            <div>
              <p className="font-medium">{a.title}</p>
              <p className="text-xs text-muted-foreground">
                by {a.author.displayName} · {a.publishedAt?.toDateString()}
              </p>
            </div>
            <article className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: a.bodyHtml }} />
          </li>
        ))}
      </ul>
    </div>
  )
}
