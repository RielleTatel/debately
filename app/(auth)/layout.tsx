import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <Image
          src="/logo.png"
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover"
          priority
        />
        <span className="text-xl font-semibold tracking-tight text-foreground">
          Debately
        </span>
      </Link>
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-sm">
        {children}
      </div>
    </div>
  )
}
