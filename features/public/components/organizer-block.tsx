type Props = {
  org: { name: string; logoUrl: string | null }
  contacts: Array<{ id: string; name: string; email: string; socialLinks: unknown }>
}

export function OrganizerBlock({ org, contacts }: Props) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-3">
        {org.logoUrl && <img src={org.logoUrl} alt={org.name} className="h-10 w-10 rounded" />}
        <div>
          <p className="font-medium">{org.name}</p>
          <p className="text-xs text-muted-foreground">Organizer</p>
        </div>
      </div>
      {contacts.length > 0 && (
        <div className="mt-3 text-sm">
          <p className="font-medium mb-1">Contacts</p>
          {contacts.map((c) => (
            <p key={c.id} className="text-muted-foreground">
              {c.name} · {c.email}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
