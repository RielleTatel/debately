'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateAdjudicatorSchema, type UpdateAdjudicatorInput } from '@/features/adjudicators/schemas'
import { updateAdjudicatorAction } from '@/features/adjudicators/actions/update-adjudicator'
import type { Adjudicator } from '@prisma/client'

export function AdjudicatorEditForm({ adjudicator }: { adjudicator: Adjudicator }) {
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
  return (
    <form
      className="space-y-3 rounded-lg border p-4"
      onSubmit={form.handleSubmit(async (values) => {
        setSaving(true); setError(null)
        const fd = new FormData()
        Object.entries(values).forEach(([k, v]) => { if (v != null) fd.append(k, String(v)) })
        const r = await updateAdjudicatorAction(fd)
        setSaving(false)
        if (!r.ok) setError(r.error)
      })}
    >
      <div><Label>Name</Label><Input {...form.register('displayName')} /></div>
      <div><Label>Email</Label><Input type="email" {...form.register('email')} /></div>
      <div><Label>Phone</Label><Input {...form.register('phone')} /></div>
      <div><Label>Experience level</Label><Input {...form.register('experienceLevel')} /></div>
      <div><Label>Availability notes</Label><Input {...form.register('availabilityNotes')} /></div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={saving} size="sm">{saving ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}
