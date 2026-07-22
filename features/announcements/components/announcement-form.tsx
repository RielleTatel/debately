'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RichTextEditor } from './rich-text-editor'
import { createDraftAnnouncementAction } from '@/features/announcements/actions'

type InstitutionOption = { id: string; name: string }

export function AnnouncementForm({ tournamentId, institutions }: { tournamentId: string; institutions: InstitutionOption[] }) {
  const [body, setBody] = useState('<p></p>')
  const [isAll, setIsAll] = useState(true)
  const [selectedIns, setSelectedIns] = useState<Set<string>>(new Set())
  const [isPublic, setIsPublic] = useState(false)
  const [scheduled, setScheduled] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(fd: FormData) {
    setError(null)
    fd.set('tournamentId', tournamentId)
    fd.set('bodyHtml', body)
    fd.set('isAllInstitutions', isAll ? 'true' : 'false')
    fd.set('isPublic', isPublic ? 'true' : 'false')
    if (scheduled) fd.set('scheduledFor', scheduled)
    if (!isAll) selectedIns.forEach((id) => fd.append('institutionIds', id))
    startTransition(async () => {
      const r = await createDraftAnnouncementAction(fd)
      if (!r.ok) setError(r.error)
      else window.location.href = `/tournaments/${tournamentId}/announcements/${r.data.announcementId}`
    })
  }

  function toggleIns(id: string) {
    const next = new Set(selectedIns)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelectedIns(next)
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required minLength={3} maxLength={200} />
      </div>
      <div className="space-y-2">
        <Label>Body</Label>
        <RichTextEditor value={body} onChange={setBody} />
      </div>
      <div className="space-y-2">
        <Label>Targeting</Label>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isAll" checked={isAll} onChange={(e) => setIsAll(e.target.checked)} />
          <Label htmlFor="isAll">All institutions</Label>
        </div>
        {!isAll && (
          <div className="grid grid-cols-2 gap-1 border rounded p-2 max-h-40 overflow-auto">
            {institutions.map((i) => (
              <label key={i.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={selectedIns.has(i.id)} onChange={() => toggleIns(i.id)} />
                {i.name}
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scheduledFor">Schedule (optional)</Label>
          <Input id="scheduledFor" name="scheduledFor" type="datetime-local" value={scheduled} onChange={(e) => setScheduled(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="isPublic">Visibility</Label>
          <label className="flex items-center gap-2 text-sm h-10">
            <input type="checkbox" id="isPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            Show on public page
          </label>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">Attachment (PDF/JPG/PNG, 5MB max)</Label>
        <Input id="file" name="file" type="file" accept="application/pdf,image/jpeg,image/png" />
      </div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save draft'}</Button>
      </div>
    </form>
  )
}
