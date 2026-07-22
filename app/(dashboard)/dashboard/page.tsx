import { Suspense } from 'react'
import { requireUser } from '@/features/auth/queries'
import {
  DashboardBodyPanel,
  DashboardBodySkeleton,
} from '@/features/dashboards/components/user-dashboard/dashboard-body-panel'

export default async function DashboardPage() {
  const me = await requireUser()
  const firstName = (me.profile.displayName ?? '').split(' ')[0] || 'there'

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Welcome back, {firstName}
        </h1>
      </header>
      <Suspense fallback={<DashboardBodySkeleton />}>
        <DashboardBodyPanel />
      </Suspense>
    </div>
  )
}
