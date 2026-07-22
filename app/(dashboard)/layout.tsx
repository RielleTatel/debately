import { getCurrentUser } from '@/features/auth/queries'
import { VerifyBanner } from '@/features/auth/components/verify-banner'
import { TopHeader } from '@/components/dashboard/top-header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentUser()

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopHeader
        email={me?.user.email ?? ''}
        displayName={me?.profile.displayName ?? null}
        avatarUrl={me?.profile.avatarUrl ?? null}
      />
      {me && !me.isVerified && <VerifyBanner email={me.user.email} />}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
