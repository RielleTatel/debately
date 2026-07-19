'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition } from 'react'
import { registerSchema } from '@/features/auth/schemas'
import { registerAction } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { z } from 'zod'

type FormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (data: FormData) => {
    setServerError(null)
    const fd = new FormData()
    fd.set('email', data.email); fd.set('password', data.password); fd.set('displayName', data.displayName)
    start(async () => {
      const r = await registerAction(fd)
      if (!r.ok) setServerError(r.error)
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <label className="block">
        <span className="text-sm">Display name</span>
        <Input {...register('displayName')} aria-invalid={!!errors.displayName} />
        {errors.displayName && <p role="alert" className="text-sm text-red-600">{errors.displayName.message}</p>}
      </label>
      <label className="block">
        <span className="text-sm">Email</span>
        <Input type="email" {...register('email')} aria-invalid={!!errors.email} />
        {errors.email && <p role="alert" className="text-sm text-red-600">{errors.email.message}</p>}
      </label>
      <label className="block">
        <span className="text-sm">Password</span>
        <Input type="password" {...register('password')} aria-invalid={!!errors.password} />
        {errors.password && <p role="alert" className="text-sm text-red-600">{errors.password.message}</p>}
      </label>
      {serverError && <p role="alert" className="text-sm text-red-600">{serverError}</p>}
      <Button type="submit" disabled={pending}>Create account</Button>
    </form>
  )
}
