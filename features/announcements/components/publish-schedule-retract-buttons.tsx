'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { publishAnnouncementAction } from '@/features/announcements/actions/publish'
import { retractAnnouncementAction } from '@/features/announcements/actions/retract'

export function PublishScheduleRetractButtons({ announcementId, status }: { announcementId: string; status: string }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onRetract(fd: FormData) {
    setError(null)
    startTransition(async () => {
      const r = await retractAnnouncementAction(fd)
      if (!r.ok) setError(r.error)
    })
  }

  function onPublish() {
    setError(null)
    const fd = new FormData()
    fd.set('announcementId', announcementId)
    startTransition(async () => {
      const r = await publishAnnouncementAction(fd)
      if (!r.ok) setError(r.error)
    })
  }

  if (status === 'PUBLISHED') {
    return (
      <form action={onRetract} className="space-y-2">
        <input type="hidden" name="announcementId" value={announcementId} />
        <input type="text" name="note" placeholder="Reason for retraction" className="w-full rounded border p-2 text-sm" required minLength={3} />
        <Button type="submit" variant="destructive" disabled={pending}>Retract</Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    )
  }

  if (status === 'DRAFT' || status === 'SCHEDULED') {
    return (
      <div className="flex gap-2">
        <Button onClick={onPublish} disabled={pending}>Publish now</Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  }

  return null
}
