'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { submitRequestAction } from '@/features/requests/actions'
import { REQUEST_REGISTRY } from '@/features/requests/services/registry'

const TYPES = Object.entries(REQUEST_REGISTRY).map(([type, entry]) => ({ value: type, label: entry.label }))

export function RequestForm({ institutionId }: { institutionId: string }) {
  const [type, setType] = useState('TEAM_ADDITION')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  async function onSubmit(fd: FormData) {
    setError(null)
    fd.set('tournamentInstitutionId', institutionId)
    fd.set('type', type)
    startTransition(async () => {
      const r = await submitRequestAction(fd)
      if (!r.ok) setError(r.error)
    })
  }

  return (
    <form action={onSubmit} className="space-y-4 rounded-md border p-4">
      <div className="space-y-2">
        <Label htmlFor="reqType">Request type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger id="reqType"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reqDesc">Description</Label>
        <Input id="reqDesc" name="description" required minLength={3} maxLength={2000} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reqPayload">Payload (JSON)</Label>
        <textarea
          id="reqPayload"
          name="payload"
          className="w-full rounded border p-2 min-h-[100px] text-sm"
          defaultValue="{}"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending}>{pending ? 'Submitting...' : 'Submit request'}</Button>
    </form>
  )
}
