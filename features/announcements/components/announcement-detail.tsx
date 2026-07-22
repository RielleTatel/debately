import type { AnnouncementDetail as AD } from '@/features/announcements/types'

export function AnnouncementDetail({ announcement }: { announcement: AD }) {
  return (
    <article className="space-y-4">
      <div dangerouslySetInnerHTML={{ __html: announcement.bodyHtml }} className="prose max-w-none" />
      <section>
        <h3 className="font-medium mb-2">Targets</h3>
        {announcement.isAllInstitutions ? (
          <p className="text-sm text-muted-foreground">All institutions</p>
        ) : (
          <ul className="text-sm list-disc pl-4">
            {announcement.targets.map((t) => (
              <li key={t.tournamentInstitutionId}>{t.institution.name}</li>
            ))}
          </ul>
        )}
      </section>
    </article>
  )
}
