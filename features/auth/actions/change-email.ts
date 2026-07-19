'use server'

import { requireUser } from '@/features/auth/queries'
import { changeEmailSchema } from '@/features/auth/schemas'
import { createClient } from '@/lib/supabase/server'
import { err, ok, type ActionResult } from '@/types/api'

export async function changeEmailAction(fd: FormData): Promise<ActionResult> {
  const parsed = changeEmailSchema.safeParse({
    newEmail: fd.get('newEmail'),
    currentPassword: fd.get('currentPassword'),
  })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')

  const me = await requireUser()
  const supabase = await createClient()
  const reauth = await supabase.auth.signInWithPassword({ email: me.user.email, password: parsed.data.currentPassword })
  if (reauth.error) return err('Current password is incorrect', 'INVALID_CREDENTIALS')

  const { error } = await supabase.auth.updateUser({ email: parsed.data.newEmail })
  if (error) return err(error.message)
  return ok(undefined)
}
