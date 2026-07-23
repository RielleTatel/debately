import { NextResponse } from 'next/server'

export function POST() {
  return NextResponse.json({ error: 'Deprecated — integration migrated to Google Sheets API pull' }, { status: 410 })
}
