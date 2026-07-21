import { requireTournamentReadable } from '@/features/tournaments/permissions'
import { getAnnouncementById } from '@/features/announcements/queries'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ tournamentId: string; announcementId: string }> }) {
  const { tournamentId, announcementId } = await params
  await requireTournamentReadable(tournamentId)
  const a = await getAnnouncementById(announcementId)
  if (!a || a.tournamentId !== tournamentId) notFound()
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <p className="text-xs uppercase text-muted-foreground">{a.status}</p>
        <h1 className="text-2xl font-bold">{a.title}</h1>
        <p className="text-xs text-muted-foreground">by {a.author.displayName} · {a.publishedAt?.toDateString() ?? a.scheduledFor?.toDateString() ?? 'draft'}</p>
      </div>
      {(a.status === 'DRAFT' || a.status === 'SCHEDULED') && (
        <form
          action={async (formData: FormData) => {
            'use server'
            const { publishAnnouncementAction } = await import('@/features/announcements/actions')
            await publishAnnouncementAction(formData)
          }}
        >
          <input type="hidden" name="announcementId" value={a.id} />
          <Button type="submit">Publish now</Button>
        </form>
      )}
      {a.status === 'PUBLISHED' && (
        <form
          action={async (formData: FormData) => {
            'use server'
            const { retractAnnouncementAction } = await import('@/features/announcements/actions')
            await retractAnnouncementAction(formData)
          }}
          className="space-y-2"
        >
          <input type="hidden" name="announcementId" value={a.id} />
          <input type="text" name="note" placeholder="Reason for retraction" className="w-full rounded border p-2 text-sm" required minLength={3} />
          <Button type="submit" variant="destructive">Retract</Button>
        </form>
      )}
      {a.status === 'RETRACTED' && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-900">Retracted: {a.retractionNote}</div>}
      <article className="prose max-w-none" dangerouslySetInnerHTML={{ __html: a.bodyHtml }} />
      <section>
        <h2 className="font-medium mb-2">Targets</h2>
        {a.isAllInstitutions ? <p className="text-sm">All institutions.</p> : <ul className="text-sm list-disc pl-4">{a.targets.map((t) => <li key={t.tournamentInstitutionId}>{t.institution.name}</li>)}</ul>}
      </section>
    </div>
  )
}
