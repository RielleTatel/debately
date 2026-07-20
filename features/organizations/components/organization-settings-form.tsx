'use client'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { updateOrganizationSchema } from '@/features/organizations/schemas'
import { updateOrganizationAction } from '@/features/organizations/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { z } from 'zod'

type FormData = z.infer<typeof updateOrganizationSchema>

export function OrganizationSettingsForm({ orgId, defaultValues }: { orgId: string; defaultValues: FormData }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(updateOrganizationSchema), defaultValues,
  })
  const onSubmit = (data: FormData) => start(async () => {
    const fd = new FormData()
    fd.set('orgId', orgId); fd.set('name', data.name); fd.set('slug', data.slug); fd.set('description', data.description ?? '')
    const r = await updateOrganizationAction(fd)
    if (!r.ok) { setMsg(r.error); return }
    setMsg('Saved.')
    if (r.data.slug !== defaultValues.slug) router.push(`/organization/${r.data.slug}/settings`)
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <label className="block"><span className="text-sm">Name</span><Input {...register('name')} />{errors.name && <p role="alert" className="text-sm text-red-600">{errors.name.message}</p>}</label>
      <label className="block"><span className="text-sm">Slug</span><Input {...register('slug')} />{errors.slug && <p role="alert" className="text-sm text-red-600">{errors.slug.message}</p>}</label>
      <label className="block"><span className="text-sm">Description</span><Input {...register('description')} /></label>
      {msg && <p role="status" className="text-sm">{msg}</p>}
      <Button type="submit" disabled={pending}>Save</Button>
    </form>
  )
}
