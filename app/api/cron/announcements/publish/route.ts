import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const secret = req.headers.get('x-cron-secret')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) return new NextResponse('Unauthorized', { status: 401 })
  const due = await prisma.announcement.findMany({ where: { status: 'SCHEDULED', scheduledFor: { lte: new Date() } }, select: { id: true } })
  let published = 0
  for (const a of due) {
    await prisma.announcement.update({ where: { id: a.id }, data: { status: 'PUBLISHED', publishedAt: new Date(), scheduledFor: null } })
    published += 1
  }
  return NextResponse.json({ published })
}

export function GET() { return new NextResponse('POST only', { status: 405 }) }
