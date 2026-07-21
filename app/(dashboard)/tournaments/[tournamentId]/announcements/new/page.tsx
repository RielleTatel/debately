import { requireTournamentDirector } from '@/features/tournaments/permissions'
import { getInstitutionsForTournament } from '@/features/institutions/queries'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function NewAnnouncementPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  await requireTournamentDirector(tournamentId)
  const institutions = await getInstitutionsForTournament(tournamentId)
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">New announcement</h1>
      <form
        action={async (formData: FormData) => {
          'use server'
          const { createDraftAnnouncementAction } = await import('@/features/announcements/actions')
          await createDraftAnnouncementAction(formData)
        }}
        className="space-y-4"
      >
        <input type="hidden" name="tournamentId" value={tournamentId} />
        <input type="hidden" name="isAllInstitutions" value="true" />
        <input type="hidden" name="isPublic" value="false" />
        <input type="hidden" name="institutionIds" value="" />
        <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" name="title" required minLength={3} maxLength={200} /></div>
        <div className="space-y-2">
          <Label htmlFor="bodyHtml">Body (HTML)</Label>
          <textarea id="bodyHtml" name="bodyHtml" className="w-full rounded-md border p-2 min-h-[200px]" required maxLength={50000} />
        </div>
        <div className="space-y-2"><Label htmlFor="file">Attachment (optional)</Label><Input id="file" name="file" type="file" accept="application/pdf,image/jpeg,image/png" /></div>
        <div className="flex gap-2">
          <Button type="submit">Save draft</Button>
          <Link href={`/tournaments/${tournamentId}/announcements`} className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
