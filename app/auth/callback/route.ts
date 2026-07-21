import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/services/email'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(new URL('/login', url.origin))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(new URL('/login?error=callback', url.origin))
  }

  try {
    const { data } = await supabase.auth.getUser()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (data?.user?.email && (data.user as any).email_confirmed_at) {
      const profile = await prisma.profile.findUnique({ where: { userId: data.user.id } })
      if (profile) await emailService.sendWelcome({ to: data.user.email, displayName: profile.displayName })
    }
  } catch {
    // do not block redirect on email failure
  }

  return NextResponse.redirect(new URL(next, url.origin))
}
