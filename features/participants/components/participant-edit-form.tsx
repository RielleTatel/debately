'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateParticipantSchema, type UpdateParticipantInput } from '@/features/participants/schemas'
import { updateParticipantAction } from '@/features/participants/actions/update-participant'
import type { Participant } from '@prisma/client'

export function ParticipantEditForm({ participant }: { participant: Participant }) {
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const form = useForm<UpdateParticipantInput>({
    resolver: zodResolver(updateParticipantSchema),
    defaultValues: {
      participantId: participant.id,
      displayName: participant.displayName,
      email: participant.email ?? '',
      phone: participant.phone ?? '',
    },
  })
  return (
    <form
      className="space-y-3 rounded-lg border p-4"
      onSubmit={form.handleSubmit(async (values) => {
        setSaving(true); setError(null)
        const fd = new FormData()
        Object.entries(values).forEach(([k, v]) => { if (v != null) fd.append(k, String(v)) })
        const r = await updateParticipantAction(fd)
        setSaving(false)
        if (!r.ok) setError(r.error)
      })}
    >
      <div><Label>Name</Label><Input {...form.register('displayName')} /></div>
      <div><Label>Email</Label><Input type="email" {...form.register('email')} /></div>
      <div><Label>Phone</Label><Input {...form.register('phone')} /></div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={saving} size="sm">{saving ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}
