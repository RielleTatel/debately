'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { sendPaymentReminderAction } from '@/features/finance/actions/send-reminder'

export function SendReminderButton({ tournamentId, institutionIds }: { tournamentId: string; institutionIds: string[] }) {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<string | null>(null)
  const send = () => startTransition(async () => {
    const fd = new FormData()
    fd.set('tournamentId', tournamentId)
    institutionIds.forEach((id) => fd.append('institutionIds', id))
    const r = await sendPaymentReminderAction(fd)
    if (r.ok) setResult(`Sent: ${r.data.sent.length}, Skipped: ${r.data.skipped.length}`)
    else setResult(r.error)
  })
  return (
    <div className="space-y-1">
      <Button size="sm" variant="outline" onClick={send} disabled={pending}>{pending ? 'Sending...' : 'Send payment reminders'}</Button>
      {result && <p className="text-xs text-muted-foreground">{result}</p>}
    </div>
  )
}
