'use server'

import { redirect } from 'next/navigation'
import { authService } from '@/features/auth/services'
import { registerSchema } from '@/features/auth/schemas'
import { prisma } from '@/lib/prisma'
import { err, type ActionResult } from '@/types/api'

export async function registerAction(formData: FormData): Promise<ActionResult<{ userId: string }>> {
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

  redirect('/verify-email')
}
