import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware for route protection.
 * Uses custom JWT auth — checks for accessToken in cookies or Authorization header.
 * Protected routes redirect to /login if no token is found.
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtectedRoute =
        pathname.startsWith("/admin") ||
        pathname.startsWith("/seller") ||
        pathname.startsWith("/orders") ||
        pathname.startsWith("/profile");

    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    // Check for auth tokens in cookies
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    // Allow access if either access token exists OR refresh token exists (so frontend can refresh)
    if (!accessToken && !refreshToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
