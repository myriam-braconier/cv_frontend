// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth') || 
                    request.nextUrl.pathname === '/login' ||
                    request.nextUrl.pathname === '/register';

  // Si on n'a pas de token et qu'on n'est pas sur une page d'auth
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si on a un token et qu'on essaie d'accéder aux pages d'auth
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
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