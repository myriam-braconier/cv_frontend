import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get token from cookie
  const token = request.cookies.get('token');
  
  // Current path
  const { pathname } = request.nextUrl;

  // Define auth pages
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // If trying to access auth pages while logged in
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If trying to access protected pages while logged out
  if (!token && !isAuthPage && pathname !== '/') {
    // Save the original URL to redirect back after login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For API routes and other paths, add token to request header if exists
  if (token && pathname.startsWith('/api')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('Authorization', `Bearer ${token.value}`);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

// Ne protégez que les routes nécessaires
export const config = {
  matcher: [
    '/synthetisers/:path*',
      // Exclure les routes d'authentification et les ressources statiques
      '/((?!login|register|api|_next/static|_next/image|favicon.ico).*)',
  ]
};