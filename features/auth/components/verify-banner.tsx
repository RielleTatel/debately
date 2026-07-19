'use client'

import { useState, useTransition } from 'react'
import { resendVerificationAction } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'

export function VerifyBanner({ email }: { email: string }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const resend = () => start(async () => {
    const r = await resendVerificationAction()
    setMsg(r.ok ? 'Verification email sent.' : r.error)
  })

  return (
    <div role="status" className="border-b bg-amber-50 px-4 py-2 text-sm">
      Please verify your email ({email}) to enable all features.{' '}
      <Button type="button" onClick={resend} disabled={pending} size="sm" variant="outline">
        Resend verification
      </Button>
      {msg && <span className="ml-2">{msg}</span>}
    </div>
  )
}
