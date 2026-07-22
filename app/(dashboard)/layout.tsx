import { getCurrentUser } from '@/features/auth/queries'
import { VerifyBanner } from '@/features/auth/components/verify-banner'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { AppTopBar } from '@/components/dashboard/app-topbar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentUser()

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar
        email={me?.user.email ?? ''}
        displayName={me?.profile.displayName ?? null}
        avatarUrl={me?.profile.avatarUrl ?? null}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopBar />
        {me && !me.isVerified && <VerifyBanner email={me.user.email} />}
        <main className="flex-1 overflow-y-auto scroll-quiet">{children}</main>
      </div>
    </div>
  )
}
