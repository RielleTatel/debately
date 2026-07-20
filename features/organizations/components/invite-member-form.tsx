'use client'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { inviteMemberSchema } from '@/features/invitations/schemas'
import { inviteMemberAction } from '@/features/invitations/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { z } from 'zod'

type FormData = z.infer<typeof inviteMemberSchema>

export function InviteMemberForm({ orgId }: { orgId: string }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(inviteMemberSchema), defaultValues: { email: '', role: 'MEMBER' },
  })
  const onSubmit = (data: FormData) => start(async () => {
    const fd = new FormData(); fd.set('orgId', orgId); fd.set('email', data.email); fd.set('role', data.role)
    const r = await inviteMemberAction(fd)
    if (!r.ok) { setMsg(r.error); return }
    setMsg('Invitation sent.'); reset()
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2" noValidate>
      <div className="flex gap-2">
        <Input {...register('email')} placeholder="colleague@example.com" />
        <input type="hidden" {...register('role')} value="MEMBER" />
        <Button type="submit" disabled={pending}>Invite</Button>
      </div>
      {errors.email && <p role="alert" className="text-sm text-red-600">{errors.email.message}</p>}
      {msg && <p role="status" className="text-sm">{msg}</p>}
    </form>
  )
}
