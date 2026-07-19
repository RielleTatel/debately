import Link from 'next/link'
import { getCurrentUser } from '@/features/auth/queries'
import { logoutAction } from '@/features/auth/actions'
import { VerifyBanner } from '@/features/auth/components/verify-banner'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentUser()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <Link href="/dashboard" className="font-semibold">Debately</Link>
          <nav className="flex items-center gap-4 text-sm">
            {me && <span>{me.user.email}</span>}
            <Link href="/account">Account</Link>
            <form action={logoutAction}>
              <button className="underline" type="submit">Sign out</button>
            </form>
          </nav>
        </div>
      </header>
      {me && !me.isVerified && <VerifyBanner email={me.user.email} />}
      <div className="flex-1">{children}</div>
    </div>
  )
}
