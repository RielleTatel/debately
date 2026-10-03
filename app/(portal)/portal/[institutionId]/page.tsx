import Link from 'next/link'
import { requireInstitutionRep } from '@/features/portal/permissions'
import { Suspense } from 'react'
import { getInstitutionSummary } from '@/features/portal/queries/summary'
import { InstitutionDashboard } from '@/features/portal/components/institution-dashboard'
import type { TournamentInstitution } from '@prisma/client'

async function Summary({ institution }: { institution: TournamentInstitution }) {
  const summary = await getInstitutionSummary(institution.id)
  return <InstitutionDashboard institution={institution} summary={summary} />
}

export default async function InstitutionDashboardPage({
  params,
}: {
  params: Promise<{ institutionId: string }>
}) {
  const { institutionId } = await params
  const { institution } = await requireInstitutionRep(institutionId)
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{institution.name}</h1>
          <p className="text-sm text-muted-foreground">Institution portal</p>
        </div>
        <Link href={`/portal/${institution.id}/profile`} className="text-sm underline">
          Edit profile
        </Link>
      </div>
      <Suspense
        fallback={
          <div
            aria-label="Loading portal totals"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-[94px] animate-pulse rounded-lg border bg-muted" />
            ))}
          </div>
        }
      >
        <Summary institution={institution} />
      </Suspense>
    </div>
  )
}
