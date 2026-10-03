import { after, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/services/email'
import { logger } from '@/services/logger'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(new URL('/login', url.origin))
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(new URL('/login?error=callback', url.origin))
  }

  const user = data?.user
  if (user?.email && user.email_confirmed_at) {
    const userId = user.id
    const email = user.email
    after(async () => {
      try {
        const profile = await prisma.profile.findUnique({
          where: { userId },
          select: { displayName: true },
        })
        if (profile) await emailService.sendWelcome({ to: email, displayName: profile.displayName })
      } catch (error) {
        logger.warn('Welcome email failed after authentication', {
          userId,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    })
  }

  return NextResponse.redirect(new URL(next, url.origin))
}
