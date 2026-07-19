'use server'

import { redirect } from 'next/navigation'
import { authService } from '@/features/auth/services'

export async function logoutAction(): Promise<void> {
  await authService.signOut()
  redirect('/login')
}
