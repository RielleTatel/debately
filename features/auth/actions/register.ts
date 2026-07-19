'use server'

import { redirect } from 'next/navigation'
import { authService } from '@/features/auth/services'
import { registerSchema } from '@/features/auth/schemas'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/services/email'
import { env } from '@/lib/env'
import { logger } from '@/services/logger'
import { err, type ActionResult } from '@/types/api'

export async function registerAction(formData: FormData): Promise<ActionResult<void>> {
  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    displayName: formData.get('displayName'),
  })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')

  const { data, error } = await authService.signUp(parsed.data)
  if (error || !data?.user) return err(error?.message ?? 'Sign up failed')

  await prisma.profile.create({
    data: { userId: data.user.id, displayName: parsed.data.displayName },
  })

  try {
    await emailService.sendWelcome({ to: parsed.data.email, displayName: parsed.data.displayName })
  } catch (e) {
    logger.error('Failed to send welcome email', { email: parsed.data.email, error: e })
  }

  try {
    const verifyUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/verify-email`
    await emailService.sendVerification({ to: parsed.data.email, verifyUrl, displayName: parsed.data.displayName })
  } catch (e) {
    logger.error('Failed to send verification email', { email: parsed.data.email, error: e })
  }

  redirect('/verify-email')
}
