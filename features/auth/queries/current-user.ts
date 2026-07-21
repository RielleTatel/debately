import { authService } from '@/features/auth/services'
import { prisma } from '@/lib/prisma'
import { Errors } from '@/lib/errors'

export type CurrentUser = {
  user: { id: string; email: string }
  profile: { id: string; displayName: string; avatarUrl: string | null }
  isVerified: boolean
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { data, error } = await authService.getUser()
  if (error || !data?.user?.email) return null
  const profile = await prisma.profile.findUnique({ where: { userId: data.user.id } })
  if (!profile) return null
  return {
    user: { id: data.user.id, email: data.user.email },
    profile: { id: profile.id, displayName: profile.displayName, avatarUrl: profile.avatarUrl },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isVerified: Boolean((data.user as any).email_confirmed_at),
  }
}

export async function requireUser(): Promise<CurrentUser> {
  const u = await getCurrentUser()
  if (!u) throw Errors.unauthorized()
  return u
}

export async function requireVerifiedUser(): Promise<CurrentUser> {
  const u = await requireUser()
  if (!u.isVerified) throw Errors.emailNotVerified()
  return u
}
