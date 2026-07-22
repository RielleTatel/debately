import { notFound } from 'next/navigation'
import { getPublicTournamentBySlug, getPublicInstitutions } from '@/features/public/queries/tournament'
import {
  InfoBlock,
  OrganizerBlock,
  ScheduleTable,
  InstitutionsList,
  DocsList,
  ContactCard,
} from '@/features/public/components'

export default async function PublicTournamentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const t = await getPublicTournamentBySlug(slug)
  if (!t) notFound()
  const institutions = await getPublicInstitutions(t.id)
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <InfoBlock tournament={t} />
      <OrganizerBlock org={t.organization} contacts={t.contacts} />
      <ScheduleTable entries={t.schedule} />
      <InstitutionsList institutions={institutions} />
      <DocsList assets={t.publicAssets} />
      <ContactCard slug={slug} contacts={t.contacts} />
    </div>
  )
}
