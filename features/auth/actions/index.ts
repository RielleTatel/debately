'use server'

import { redirect } from 'next/navigation'
import { authService } from '@/features/auth/services'
import { loginSchema, registerSchema, forgotPasswordSchema } from '@/features/auth/schemas'
import type { ActionResult } from '@/types/api'
import { ok, err } from '@/types/api'

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')

  const { error } = await authService.signIn(parsed.data)
  if (error) return err(error.message)

  redirect('/dashboard')
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    displayName: formData.get('displayName'),
  })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')

  const { error } = await authService.signUp(parsed.data)
  if (error) return err(error.message)

  redirect('/verify-email')
}

export async function forgotPasswordAction(formData: FormData): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) return err(parsed.error.errors[0].message)

  await authService.sendPasswordReset(parsed.data.email)
  return ok(undefined)
}

export async function signOutAction(): Promise<void> {
  await authService.signOut()
  redirect('/login')
}
