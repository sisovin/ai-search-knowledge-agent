import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Define protected routes that require authentication
const protectedRoutes = ["/profile", "/settings", "/documents"];
// Define auth routes
const authRoutes = ["/auth/login", "/auth/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from the session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If it's a protected route and no token, redirect to login
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // If user is logged in and tries to access auth pages, redirect to home
  if (authRoutes.some((route) => pathname.startsWith(route)) && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Matcher for routes that the middleware should be applied to
export const config = {
  matcher: [
    // Protected routes
    "/profile/:path*",
    "/settings/:path*",
    "/documents/:path*",
    // Auth routes
    "/auth/login",
    "/auth/signup",
  ],
};
