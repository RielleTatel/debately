import { MembersPanelSkeleton } from '@/features/organizations/components/members-panel'

export default function Loading() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <div className="animate-pulse rounded bg-muted h-5 w-24" />
        <MembersPanelSkeleton />
      </div>
    </section>
  )
}
