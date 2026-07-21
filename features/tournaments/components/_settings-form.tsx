'use client'
import { useState, useTransition, type ReactNode, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import type { ActionResult } from '@/types/api'

type Props = {
  action: (fd: FormData) => Promise<ActionResult<unknown>>
  submitLabel: string
  children: ReactNode
  disabled?: boolean
  onSuccess?: () => void
}

export function SettingsForm({ action, submitLabel, children, disabled, onSuccess }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [pending, startTransition] = useTransition()

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null); setOk(false)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const r = await action(fd)
      if (!r.ok) setError(r.error)
      else { setOk(true); onSuccess?.() }
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {children}
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      {ok && <p className="text-sm text-emerald-700">Saved.</p>}
      <Button type="submit" disabled={pending || disabled}>{pending ? 'Saving...' : submitLabel}</Button>
    </form>
  )
}
