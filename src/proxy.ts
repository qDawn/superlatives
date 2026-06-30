import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export function proxy(request: NextRequest) {
  const session = getSessionCookie(request)
  const { pathname } = request.nextUrl

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isAppRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/rooms') || pathname.startsWith('/admin') || pathname.startsWith('/profile')

  if (!session && isAppRoute) {
    return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url))
  }

  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}