const dateTime = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})
export function formatDateTimeUTC(value: Date | string) {
  return `${dateTime.format(new Date(value))} UTC`
}
