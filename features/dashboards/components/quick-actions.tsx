import { Upload, Megaphone, Wallet, Inbox, Globe, Users } from 'lucide-react'
import { ActionCard } from '@/components/ui/action-card'

export function QuickActions({
  tournamentId,
  isDirector,
}: {
  tournamentId: string
  isDirector: boolean
}) {
  return (
    <div className="grid gap-2">
      <ActionCard
        title="Import CSV"
        description="Upload registrations from a Google Form or spreadsheet"
        href={`/tournaments/${tournamentId}/imports/new`}
        icon={<Upload className="h-4 w-4" strokeWidth={2} />}
      />
      <ActionCard
        title="Send announcement"
        description="Notify all institutions via portal & email"
        href={`/tournaments/${tournamentId}/announcements/new`}
        icon={<Megaphone className="h-4 w-4" strokeWidth={2} />}
      />
      <ActionCard
        title="Finance overview"
        description="Invoices, payments, and outstanding balances"
        href={`/tournaments/${tournamentId}/finance`}
        icon={<Wallet className="h-4 w-4" strokeWidth={2} />}
      />
      <ActionCard
        title="Request queue"
        description="Institution submissions awaiting review"
        href={`/tournaments/${tournamentId}/requests`}
        icon={<Inbox className="h-4 w-4" strokeWidth={2} />}
      />
      {isDirector && (
        <ActionCard
          title="Institution portals"
          description="Manage claim tokens and portal access"
          href={`/tournaments/${tournamentId}/institutions`}
          icon={<Users className="h-4 w-4" strokeWidth={2} />}
        />
      )}
      <ActionCard
        title="Public tournament page"
        description="Configure the outward-facing page"
        href={`/tournaments/${tournamentId}/settings`}
        icon={<Globe className="h-4 w-4" strokeWidth={2} />}
      />
    </div>
  )
}
