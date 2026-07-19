'use server'

import { redirect } from 'next/navigation'
import { resetPasswordSchema } from '@/features/auth/schemas'
import { createClient } from '@/lib/supabase/server'
import { err, type ActionResult } from '@/types/api'

export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')

  const supabase = await createClient()
  const { error: updErr } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (updErr) return err(updErr.message)

  // Invalidate all other sessions (SRS §3.3)
  await supabase.auth.signOut({ scope: 'others' })

  redirect('/login')
}
