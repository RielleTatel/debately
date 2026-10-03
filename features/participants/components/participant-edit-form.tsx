'use client'

import { useState } from 'react'
import { useRosterDraft } from '@/hooks/use-roster-draft'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  updateParticipantSchema,
  type UpdateParticipantInput,
} from '@/features/participants/schemas'
import { updateParticipantAction } from '@/features/participants/actions/update-participant'
import type { Participant } from '@prisma/client'

export function ParticipantEditForm({
  participant,
  draftKey,
}: {
  participant: Pick<Participant, 'id' | 'displayName' | 'email' | 'phone'>
  draftKey?: string
}) {
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
  const clearDraft = useRosterDraft(draftKey, form)
  const [saved, setSaved] = useState(false)
  return (
    <form
      className="space-y-3 rounded-lg border p-4"
      onSubmit={form.handleSubmit(async (values) => {
        setSaving(true)
        setError(null)
        setSaved(false)
        const fd = new FormData()
        Object.entries(values).forEach(([k, v]) => {
          if (v != null) fd.append(k, String(v))
        })
        try {
          const r = await updateParticipantAction(fd)
          if (!r.ok) setError(r.error)
          else {
            form.reset(values)
            clearDraft()
            setSaved(true)
          }
        } catch {
          setError('Could not save. Please try again.')
        } finally {
          setSaving(false)
        }
      })}
    >
      <div>
        <Label htmlFor="displayName">Name</Label>
        <Input id="displayName" {...form.register('displayName')} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...form.register('email')} />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...form.register('phone')} />
      </div>
      {Object.values(form.formState.errors).map((issue, index) => (
        <p key={index} role="alert" className="text-sm text-destructive">
          {String(issue?.message ?? 'Check this field.')}
        </p>
      ))}
      {saved && (
        <p role="status" className="text-sm text-muted-foreground">
          Saved.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={saving} size="sm">
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
