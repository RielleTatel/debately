import Link from 'next/link'
import { UserMenu } from './user-menu'

type Props = {
  email: string
  displayName: string | null
  avatarUrl: string | null
}

export function TopHeader({ email, displayName, avatarUrl }: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <Link href="/dashboard" className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-700 text-xs font-bold text-white">
          D
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-slate-900">Debately</span>
      </Link>
      <UserMenu email={email} displayName={displayName} avatarUrl={avatarUrl} />
    </header>
  )
}
