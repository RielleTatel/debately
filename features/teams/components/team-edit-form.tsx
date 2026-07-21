'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateTeamSchema, type UpdateTeamInput } from '@/features/teams/schemas'
import { updateTeamAction } from '@/features/teams/actions/update-team'
import type { Team } from '@prisma/client'

export function TeamEditForm({ team }: { team: Team }) {
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const form = useForm<UpdateTeamInput>({
    resolver: zodResolver(updateTeamSchema),
    defaultValues: { teamId: team.id, name: team.name, isNovice: team.isNovice },
  })
  return (
    <form
      className="space-y-3 rounded-lg border p-4"
      onSubmit={form.handleSubmit(async (values) => {
        setSaving(true); setError(null)
        const fd = new FormData()
        fd.append('teamId', values.teamId)
        if (values.name != null) fd.append('name', values.name)
        if (values.isNovice != null) fd.append('isNovice', values.isNovice ? 'true' : 'false')
        const r = await updateTeamAction(fd)
        setSaving(false)
        if (!r.ok) setError(r.error)
      })}
    >
      <div><Label>Team name</Label><Input {...form.register('name')} /></div>
      <div className="flex items-center gap-2">
        <input id={`novice-${team.id}`} type="checkbox" {...form.register('isNovice')} />
        <Label htmlFor={`novice-${team.id}`}>Novice bracket eligible</Label>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}
