import { SettingsSubNav } from '@/features/tournaments/components/settings-sub-nav'

type Props = { params: Promise<{ tournamentId: string }>; children: React.ReactNode }

export default async function SettingsLayout({ params, children }: Props) {
  const { tournamentId } = await params

  return (
    <div className="space-y-6">
      <SettingsSubNav tournamentId={tournamentId} />
      {children}
    </div>
  )
}
