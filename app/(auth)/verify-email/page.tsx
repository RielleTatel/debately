import { getCurrentUser } from '@/features/auth/queries'
import { VerifyBanner } from '@/features/auth/components/verify-banner'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Verify your email' }

export default async function VerifyEmailPage() {
  const me = await getCurrentUser()
  if (me?.isVerified) redirect('/dashboard')

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Verify your email</h1>
      <p>We sent a verification link to your email. Please click it to activate your account.</p>
      {me && <VerifyBanner email={me.user.email} />}
    </main>
  )
}
