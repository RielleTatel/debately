import { NextResponse } from 'next/server'
import { syncAllActiveSources } from '@/features/google-form-integration/services/sync'

export async function POST(req: Request) {
  const secret = req.headers.get('x-cron-secret')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const result = await syncAllActiveSources()
  return NextResponse.json(result)
}

export function GET() {
  return new NextResponse('POST only', { status: 405 })
}
