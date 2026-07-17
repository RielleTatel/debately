import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  console.log('[webhook]', body)
  return NextResponse.json({ received: true })
}
