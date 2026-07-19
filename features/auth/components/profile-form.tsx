'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition } from 'react'
import { updateProfileSchema } from '@/features/auth/schemas'
import { updateProfileAction } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { z } from 'zod'

type FormData = z.infer<typeof updateProfileSchema>

export function ProfileForm({ displayName }: { displayName: string }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { displayName },
  })

  const onSubmit = (data: FormData) => start(async () => {
    const fd = new FormData(); fd.set('displayName', data.displayName)
    const r = await updateProfileAction(fd)
    setMsg(r.ok ? 'Saved.' : r.error)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <label className="block">
        <span className="text-sm">Display name</span>
        <Input {...register('displayName')} aria-invalid={!!errors.displayName} />
        {errors.displayName && <p role="alert" className="text-sm text-red-600">{errors.displayName.message}</p>}
      </label>
      {msg && <p role="status" className="text-sm">{msg}</p>}
      <Button type="submit" disabled={pending}>Save</Button>
    </form>
  )
}
