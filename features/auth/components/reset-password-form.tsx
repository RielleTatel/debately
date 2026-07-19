'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition } from 'react'
import { resetPasswordSchema } from '@/features/auth/schemas'
import { resetPasswordAction } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { z } from 'zod'

type FormData = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(resetPasswordSchema) })

  const onSubmit = (data: FormData) => {
    setServerError(null)
    start(async () => {
      const fd = new FormData()
      fd.set('password', data.password); fd.set('confirmPassword', data.confirmPassword)
      const r = await resetPasswordAction(fd)
      if (!r.ok) setServerError(r.error)
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <label className="block">
        <span className="text-sm">New password</span>
        <Input type="password" {...register('password')} aria-invalid={!!errors.password} />
        {errors.password && <p role="alert" className="text-sm text-red-600">{errors.password.message}</p>}
      </label>
      <label className="block">
        <span className="text-sm">Confirm password</span>
        <Input type="password" {...register('confirmPassword')} aria-invalid={!!errors.confirmPassword} />
        {errors.confirmPassword && <p role="alert" className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
      </label>
      {serverError && <p role="alert" className="text-sm text-red-600">{serverError}</p>}
      <Button type="submit" disabled={pending}>Set new password</Button>
    </form>
  )
}
