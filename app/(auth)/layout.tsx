import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <Link href="/" className="mb-8 text-xl font-semibold tracking-tight text-foreground">
        Debately
      </Link>
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-sm">
        {children}
      </div>
    </div>
  )
}
