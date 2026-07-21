'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { createTournamentAction } from '@/features/tournaments/actions'

type Props = {
  orgOptions: Array<{ id: string; name: string }>
  defaultOrgId: string
}

export function TournamentCreateForm({ orgOptions, defaultOrgId }: Props) {
  const [orgId, setOrgId] = useState(defaultOrgId)
  const [format, setFormat] = useState<'BP' | 'AP' | 'WSDC' | 'CP' | 'CUSTOM'>('BP')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  async function onSubmit(formData: FormData) {
    setError(null)
    formData.set('orgId', orgId)
    formData.set('format', format)
    startTransition(async () => {
      const result = await createTournamentAction(formData)
      if (!result.ok) setError(result.error)
    })
  }

  return (
    <form action={onSubmit} className="space-y-4 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="org">Organization</Label>
        <Select value={orgId} onValueChange={setOrgId}>
          <SelectTrigger id="org"><SelectValue /></SelectTrigger>
          <SelectContent>
            {orgOptions.map((o) => (<SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Tournament name</Label>
        <Input id="name" name="name" required minLength={3} maxLength={120} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" required pattern="[a-z0-9-]+" minLength={3} maxLength={64} />
        <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens. Unique within your organization.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="format">Debate format</Label>
        <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
          <SelectTrigger id="format"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="BP">British Parliamentary</SelectItem>
            <SelectItem value="AP">Asian Parliamentary</SelectItem>
            <SelectItem value="WSDC">World Schools</SelectItem>
            <SelectItem value="CP">Canadian Parliamentary</SelectItem>
            <SelectItem value="CUSTOM">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start date</Label>
          <Input id="startDate" name="startDate" type="datetime-local" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End date</Label>
          <Input id="endDate" name="endDate" type="datetime-local" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="registrationDeadline">Registration deadline</Label>
        <Input id="registrationDeadline" name="registrationDeadline" type="datetime-local" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentDeadline">Payment deadline (optional)</Label>
        <Input id="paymentDeadline" name="paymentDeadline" type="datetime-local" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="venue">Venue</Label>
        <Input id="venue" name="venue" required maxLength={200} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" required maxLength={500} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxTeamSlots">Maximum team slots</Label>
        <Input id="maxTeamSlots" name="maxTeamSlots" type="number" min={1} max={10000} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" name="description" rows={4} maxLength={2000} />
      </div>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>{pending ? 'Creating...' : 'Create tournament'}</Button>
      </div>
    </form>
  )
}
