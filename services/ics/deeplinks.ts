type EventLite = { title: string; start: Date; end: Date; description?: string; location?: string }

export function googleCalendarLink(e: EventLite): string {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  return `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${fmt(e.start)}/${fmt(e.end)}`,
    details: e.description ?? '',
    location: e.location ?? '',
  }).toString()}`
}

export function outlookCalendarLink(e: EventLite): string {
  return `https://outlook.live.com/calendar/0/deeplink/compose?${new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: e.title,
    body: e.description ?? '',
    startdt: e.start.toISOString(),
    enddt: e.end.toISOString(),
    location: e.location ?? '',
  }).toString()}`
}
