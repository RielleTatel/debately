import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MarketingHomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-border">
        <span className="text-lg font-semibold tracking-tight">Debately</span>
        <Link href="/login">
          <Button variant="ghost" size="sm">Sign in</Button>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          Debate. Organize. Win.
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          Tournament management built for debate teams — from registration to results.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Link href="/register">
            <Button size="lg">Get started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">Sign in</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
