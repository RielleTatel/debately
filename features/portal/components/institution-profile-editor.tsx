'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateInstitutionProfileSchema, type UpdateInstitutionProfileInput } from '@/features/portal/schemas'
import {
  updateInstitutionProfileAction,
} from '@/features/portal/actions/update-institution-profile'
import { uploadInstitutionLogoAction } from '@/features/portal/actions/upload-institution-logo'
import type { TournamentInstitution } from '@prisma/client'

export function InstitutionProfileEditor({ institution }: { institution: TournamentInstitution }) {
  const [logoUrl, setLogoUrl] = useState(institution.logoUrl ?? null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const form = useForm<UpdateInstitutionProfileInput>({
    resolver: zodResolver(updateInstitutionProfileSchema),
    defaultValues: {
      institutionId: institution.id,
      contactName: institution.contactName ?? '',
      contactEmail: institution.contactEmail ?? '',
      contactPhone: institution.contactPhone ?? '',
    },
  })

  const uploadLogo = async (file: File) => {
    setError(null)
    const fd = new FormData(); fd.append('institutionId', institution.id); fd.append('file', file)
    const r = await uploadInstitutionLogoAction(fd)
    if (!r.ok) { setError(r.error); return }
    setLogoUrl(r.data.logoUrl)
  }

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit(async (values) => {
        setSaving(true); setError(null)
        const fd = new FormData()
        Object.entries(values).forEach(([k, v]) => { if (v != null) fd.append(k, String(v)) })
        const r = await updateInstitutionProfileAction(fd)
        setSaving(false)
        if (!r.ok) setError(r.error)
      })}
    >
      <section className="space-y-2">
        <Label>Logo</Label>
        {logoUrl && <img src={logoUrl} alt={`${institution.name} logo`} className="h-16 w-16 rounded object-cover" />}
        <Input
          type="file" accept="image/png,image/jpeg"
          onChange={(e) => {
            const f = e.target.files?.[0]; if (f) void uploadLogo(f)
          }}
        />
      </section>

      <section className="space-y-3">
        <div>
          <Label>Institution name</Label>
          <Input value={institution.name} disabled />
          <p className="mt-1 text-xs text-muted-foreground">Name changes require a request to the Tournament Director.</p>
        </div>
        <div>
          <Label htmlFor="contactName">Primary contact</Label>
          <Input id="contactName" {...form.register('contactName')} />
        </div>
        <div>
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input id="contactEmail" type="email" {...form.register('contactEmail')} />
        </div>
        <div>
          <Label htmlFor="contactPhone">Contact phone</Label>
          <Input id="contactPhone" {...form.register('contactPhone')} />
        </div>
      </section>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</Button>
      </div>
    </form>
  )
}
