import { getCurrentUser } from '@/features/auth/queries'
import { VerifyBanner } from '@/features/auth/components/verify-banner'
import { DashboardSidebar } from '@/components/dashboard/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentUser()

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar
        email={me?.user.email ?? ''}
        displayName={me?.profile.displayName ?? null}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        {me && !me.isVerified && <VerifyBanner email={me.user.email} />}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
