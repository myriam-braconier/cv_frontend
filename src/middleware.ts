import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  const path = request.nextUrl.pathname

  if (path.startsWith('/admin') || path.startsWith('/profile')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (path.startsWith('/api') && token) {
    const headers = new Headers(request.headers)
    headers.set('Authorization', `Bearer ${token.value}`)
    return NextResponse.next({
      request: { headers }
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)']
}