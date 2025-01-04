import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	// Définir le type du token
	const tokenCookie = request.cookies.get("token");
	const token = tokenCookie ? tokenCookie.value : null;

	const { pathname } = request.nextUrl;

	// -----------on définit les routes protégées-------------------
	// Définir les routes qui nécessitent une authentification
	const protectedPaths = [
		"/admin",
		"/profile",
		// autres routes protégées...
	];

	// Définir les routes publiques qui doivent toujours être accessibles
	const publicPaths = ["/login", "/register", "/api/auth", "/"];

	// Vérifier si c'est une route publique
	const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

	// Vérifier si la route actuelle est une route protégée
	const isProtectedPath = protectedPaths.some((path) =>
		request.nextUrl.pathname.startsWith(path)
	);
	// Si c'est une route publique, autoriser l'accès
	if (isPublicPath) {
		return NextResponse.next();
	}

	// Si ce n'est pas une route protégée, laisser passer tout le monde
	// Si c'est une route protégée et qu'il n'y a pas de token
	if (isProtectedPath && !token) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(loginUrl);
	}

	// Pour les routes API, ajouter le token dans le header
	if (token && pathname.startsWith("/api")) {
		const requestHeaders = new Headers(request.headers);
		requestHeaders.set("Authorization", `Bearer ${token}`);
		return NextResponse.next({
			request: {
				headers: requestHeaders,
			},
		});
	}
	// -----------------------------------------------------------

	return NextResponse.next();
}

// Ne protégez que les routes nécessaires
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api/auth (auth API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
	],
};
