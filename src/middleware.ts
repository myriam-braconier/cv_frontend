import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get('token');
  const token = tokenCookie ? tokenCookie.value : null;
  const pathname = request.nextUrl.pathname;

  // Routes protégées
  if (pathname.startsWith('/admin') || pathname.startsWith('/profile')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Routes API
  if (pathname.startsWith('/api') && token) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('Authorization', `Bearer ${token}`);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)'
  ]
};