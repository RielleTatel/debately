import Link from 'next/link'
export function SummaryCard({ label, value, link }: { label: string; value: string; link?: string }) {
  const content = <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="text-lg font-medium">{value}</p></div>
  return link ? <Link href={link}>{content}</Link> : content
}
