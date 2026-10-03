import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PROTECTED = ['/dashboard', '/account', '/organization', '/tournaments', '/settings']
const AUTH_ROUTES = ['/login', '/register']
const PUBLIC_PAGES = ['/', '/pricing', '/features', '/about', '/contact']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (
    (request.method === 'GET' || request.method === 'HEAD') &&
    (PUBLIC_PAGES.includes(pathname) || pathname.startsWith('/t/'))
  ) {
    return NextResponse.next()
  }
  const { response, user } = await updateSession(request)

  if (!user && PROTECTED.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  if (user && AUTH_ROUTES.some((p) => pathname === p)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
