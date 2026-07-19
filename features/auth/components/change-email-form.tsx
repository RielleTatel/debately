'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition } from 'react'
import { changeEmailSchema } from '@/features/auth/schemas'
import { changeEmailAction } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { z } from 'zod'

type FormData = z.infer<typeof changeEmailSchema>

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(changeEmailSchema) })

  const onSubmit = (data: FormData) => start(async () => {
    const fd = new FormData()
    fd.set('newEmail', data.newEmail); fd.set('currentPassword', data.currentPassword)
    const r = await changeEmailAction(fd)
    setMsg(r.ok ? 'Check your new inbox to confirm the change.' : r.error)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <p className="text-sm text-muted-foreground">Current email: {currentEmail}</p>
      <label className="block">
        <span className="text-sm">New email</span>
        <Input type="email" {...register('newEmail')} aria-invalid={!!errors.newEmail} />
        {errors.newEmail && <p role="alert" className="text-sm text-red-600">{errors.newEmail.message}</p>}
      </label>
      <label className="block">
        <span className="text-sm">Current password</span>
        <Input type="password" {...register('currentPassword')} aria-invalid={!!errors.currentPassword} />
        {errors.currentPassword && <p role="alert" className="text-sm text-red-600">{errors.currentPassword.message}</p>}
      </label>
      {msg && <p role="status" className="text-sm">{msg}</p>}
      <Button type="submit" disabled={pending}>Change email</Button>
    </form>
  )
}
