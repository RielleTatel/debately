import { NextResponse } from 'next/server'
import { drainQueries } from '../../../fixtures/prisma'
export const dynamic = 'force-dynamic'
export async function GET() {
  return NextResponse.json(drainQueries())
}
