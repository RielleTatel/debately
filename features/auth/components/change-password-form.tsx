'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition } from 'react'
import { changePasswordSchema } from '@/features/auth/schemas'
import { changePasswordAction } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { z } from 'zod'

type FormData = z.infer<typeof changePasswordSchema>

export function ChangePasswordForm() {
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({ resolver: zodResolver(changePasswordSchema) })

  const onSubmit = (data: FormData) => start(async () => {
    const fd = new FormData()
    fd.set('currentPassword', data.currentPassword); fd.set('newPassword', data.newPassword); fd.set('confirmPassword', data.confirmPassword)
    const r = await changePasswordAction(fd)
    setMsg(r.ok ? 'Password updated.' : r.error)
    if (r.ok) reset()
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <label className="block">
        <span className="text-sm">Current password</span>
        <Input type="password" {...register('currentPassword')} aria-invalid={!!errors.currentPassword} />
        {errors.currentPassword && <p role="alert" className="text-sm text-red-600">{errors.currentPassword.message}</p>}
      </label>
      <label className="block">
        <span className="text-sm">New password</span>
        <Input type="password" {...register('newPassword')} aria-invalid={!!errors.newPassword} />
        {errors.newPassword && <p role="alert" className="text-sm text-red-600">{errors.newPassword.message}</p>}
      </label>
      <label className="block">
        <span className="text-sm">Confirm new password</span>
        <Input type="password" {...register('confirmPassword')} aria-invalid={!!errors.confirmPassword} />
        {errors.confirmPassword && <p role="alert" className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
      </label>
      {msg && <p role="status" className="text-sm">{msg}</p>}
      <Button type="submit" disabled={pending}>Change password</Button>
    </form>
  )
}
