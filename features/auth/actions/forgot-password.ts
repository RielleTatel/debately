'use server'

import { forgotPasswordSchema } from '@/features/auth/schemas'
import { authService } from '@/features/auth/services'
import { rateLimit } from '@/lib/rate-limit'
import { err, ok, type ActionResult } from '@/types/api'

export async function forgotPasswordAction(formData: FormData): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) return ok(undefined)  // anti-enumeration

  const gate = rateLimit(`pwreset:${parsed.data.email.toLowerCase()}`, 3, 60 * 60_000)
  if (!gate.ok) return err('Too many attempts. Try again later.', 'RATE_LIMITED')

  await authService.sendPasswordReset(parsed.data.email)
  return ok(undefined)
}
