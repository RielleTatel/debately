'use server'

import { redirect } from 'next/navigation'
import { authService } from '@/features/auth/services'
import { loginSchema } from '@/features/auth/schemas'
import { err, type ActionResult } from '@/types/api'

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return err('Invalid email or password', 'INVALID_CREDENTIALS')

  const { data, error } = await authService.signIn(parsed.data)
  if (error || !data?.session) return err('Invalid email or password', 'INVALID_CREDENTIALS')

  redirect('/dashboard')
}
