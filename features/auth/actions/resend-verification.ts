'use server'

import { authService } from '@/features/auth/services'
import { rateLimit } from '@/lib/rate-limit'
import { err, ok, type ActionResult } from '@/types/api'

export async function resendVerificationAction(): Promise<ActionResult> {
  const { data, error } = await authService.getUser()
  if (error || !data?.user?.email) return err('Not signed in', 'UNAUTHORIZED')

  const gate = rateLimit(`verify:${data.user.email.toLowerCase()}`, 1, 60_000)
  if (!gate.ok) return err('Please wait a minute before resending.', 'RATE_LIMITED')

  const { error: resendErr } = await authService.sendVerificationEmail(data.user.email)
  if (resendErr) return err(resendErr.message)
  return ok(undefined)
}
