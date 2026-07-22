import { Suspense } from 'react'
import { requireUser } from '@/features/auth/queries'
import { PageHeader } from '@/components/ui/page-header'
import {
  DashboardBodyPanel,
  DashboardBodySkeleton,
} from '@/features/dashboards/components/user-dashboard/dashboard-body-panel'

export default async function DashboardPage() {
  const me = await requireUser()
  const firstName = (me.profile.displayName ?? '').split(' ')[0] || 'there'

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
      <PageHeader
        eyebrow="Home"
        title={`Welcome back, ${firstName}`}
        description="Your tournaments, workspaces, and what needs attention."
      />
      <Suspense fallback={<DashboardBodySkeleton />}>
        <DashboardBodyPanel />
      </Suspense>
    </div>
  )
}
