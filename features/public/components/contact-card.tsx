import Link from 'next/link'

type Contact = { id: string; name: string; email: string }

export function ContactCard({ slug, contacts }: { slug: string; contacts: Contact[] }) {
  return (
    <div className="rounded-lg border p-4 text-center">
      <p className="text-sm font-medium">Have questions?</p>
      {contacts.length > 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          {contacts[0].name}: {contacts[0].email}
        </p>
      )}
      <Link href={`/t/${slug}/contact`} className="mt-2 inline-block text-sm text-primary hover:underline">
        Contact organizers
      </Link>
    </div>
  )
}
