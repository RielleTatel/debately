'use client'

import { useState } from 'react'
import { useRosterDraft } from '@/hooks/use-roster-draft'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  updateAdjudicatorSchema,
  type UpdateAdjudicatorInput,
} from '@/features/adjudicators/schemas'
import { updateAdjudicatorAction } from '@/features/adjudicators/actions/update-adjudicator'
import type { Adjudicator } from '@prisma/client'

export function AdjudicatorEditForm({
  adjudicator,
  draftKey,
}: {
  adjudicator: Pick<
    Adjudicator,
    'id' | 'displayName' | 'email' | 'phone' | 'experienceLevel' | 'availabilityNotes'
  >
  draftKey?: string
}) {
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const form = useForm<UpdateAdjudicatorInput>({
    resolver: zodResolver(updateAdjudicatorSchema),
    defaultValues: {
      adjudicatorId: adjudicator.id,
      displayName: adjudicator.displayName,
      email: adjudicator.email ?? '',
      phone: adjudicator.phone ?? '',
      experienceLevel: adjudicator.experienceLevel ?? '',
      availabilityNotes: adjudicator.availabilityNotes ?? '',
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
          const r = await updateAdjudicatorAction(fd)
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
      <div>
        <Label htmlFor="experienceLevel">Experience level</Label>
        <Input id="experienceLevel" {...form.register('experienceLevel')} />
      </div>
      <div>
        <Label htmlFor="availabilityNotes">Availability notes</Label>
        <Input id="availabilityNotes" {...form.register('availabilityNotes')} />
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
