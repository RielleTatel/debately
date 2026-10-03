import {
  RegistrationSkeleton,
  FinancialSkeleton,
  ImportSkeleton,
  RequestSkeleton,
} from '@/features/dashboards/components/tournament-analytics/skeletons'
export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      {[
        { title: 'Registration', Placeholder: RegistrationSkeleton },
        { title: 'Financial', Placeholder: FinancialSkeleton },
        { title: 'Imports', Placeholder: ImportSkeleton },
        { title: 'Requests', Placeholder: RequestSkeleton },
      ].map(({ title, Placeholder }) => (
        <section key={title}>
          <h2 className="text-lg font-medium mb-3">{title}</h2>
          <Placeholder />
        </section>
      ))}
    </div>
  )
}
