import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  )
}
