'use client'
import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createOrganizationSchema } from '@/features/organizations/schemas'
import { createOrganizationAction } from '@/features/organizations/actions'
import { slugify } from '@/lib/slug'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { z } from 'zod'

type FormData = z.infer<typeof createOrganizationSchema>

export function CreateOrganizationForm() {
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { name: '', slug: '', description: '' },
  })
  const name = watch('name')
  useEffect(() => { if (!watch('slug')) setValue('slug', slugify(name ?? '')) }, [name, setValue, watch])

  const onSubmit = (data: FormData) => start(async () => {
    const fd = new FormData()
    fd.set('name', data.name); fd.set('slug', data.slug); fd.set('description', data.description ?? '')
    const r = await createOrganizationAction(fd)
    if (!r.ok) setMsg(r.error)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <label className="block"><span className="text-sm">Organization name</span>
        <Input {...register('name')} aria-invalid={!!errors.name} />
        {errors.name && <p role="alert" className="text-sm text-red-600">{errors.name.message}</p>}
      </label>
      <label className="block"><span className="text-sm">Slug</span>
        <Input {...register('slug')} aria-invalid={!!errors.slug} />
        {errors.slug && <p role="alert" className="text-sm text-red-600">{errors.slug.message}</p>}
      </label>
      <label className="block"><span className="text-sm">Description (optional)</span>
        <Input {...register('description')} />
      </label>
      {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}
      <Button type="submit" disabled={pending}>Create organization</Button>
    </form>
  )
}
