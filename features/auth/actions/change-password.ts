'use server'

import { requireUser } from '@/features/auth/queries'
import { changePasswordSchema } from '@/features/auth/schemas'
import { createClient } from '@/lib/supabase/server'
import { err, ok, type ActionResult } from '@/types/api'

export async function changePasswordAction(fd: FormData): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: fd.get('currentPassword'),
    newPassword: fd.get('newPassword'),
    confirmPassword: fd.get('confirmPassword'),
  })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')

  const me = await requireUser()
  const supabase = await createClient()
  const reauth = await supabase.auth.signInWithPassword({ email: me.user.email, password: parsed.data.currentPassword })
  if (reauth.error) return err('Current password is incorrect', 'INVALID_CREDENTIALS')

  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword })
  if (error) return err(error.message)
  return ok(undefined)
}
