import { NextResponse } from 'next/server'
import { syncAllActiveSources } from '@/features/google-form-integration/services/sync'

async function runSync() {
  const result = await syncAllActiveSources()
  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const secret = req.headers.get('x-cron-secret')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  return runSync()
}

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  return runSync()
}
