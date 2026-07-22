'use client'

import { useState, useTransition } from 'react'
import { resendVerificationAction } from '@/features/auth/actions'
import { AlertTriangle } from 'lucide-react'

export function VerifyBanner({ email }: { email: string }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const resend = () =>
    start(async () => {
      const r = await resendVerificationAction()
      setMsg(r.ok ? 'Verification email sent.' : r.error)
    })

  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 border-b border-warning/25 bg-warning/8 px-4 py-2 text-[13px]"
    >
      <div className="flex items-center gap-2 text-foreground">
        <AlertTriangle className="h-3.5 w-3.5 text-warning" strokeWidth={2.25} />
        <span>
          Verify <span className="font-medium">{email}</span> to enable all features.
        </span>
        {msg && <span className="text-muted-foreground">{msg}</span>}
      </div>
      <button
        type="button"
        onClick={resend}
        disabled={pending}
        className="h-7 rounded-md border border-warning/30 bg-warning/10 px-2 text-[12.5px] font-medium text-warning transition-colors hover:bg-warning/15 disabled:opacity-50"
      >
        {pending ? 'Sending…' : 'Resend'}
      </button>
    </div>
  )
}
