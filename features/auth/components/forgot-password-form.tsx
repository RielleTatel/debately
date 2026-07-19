'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition } from 'react'
import { forgotPasswordSchema } from '@/features/auth/schemas'
import { forgotPasswordAction } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type FormData = { email: string }

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)
  const [pending, start] = useTransition()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = (data: FormData) => {
    start(async () => {
      const fd = new FormData(); fd.set('email', data.email)
      await forgotPasswordAction(fd)
      setSent(true)
    })
  }

  if (sent) return <p>If an account exists for that email, we sent a reset link.</p>

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <label className="block">
        <span className="text-sm">Email</span>
        <Input type="email" {...register('email')} aria-invalid={!!errors.email} />
        {errors.email && <p role="alert" className="text-sm text-red-600">{errors.email.message}</p>}
      </label>
      <Button type="submit" disabled={pending}>Send reset link</Button>
    </form>
  )
}
