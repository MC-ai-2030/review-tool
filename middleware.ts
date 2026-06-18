import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "review-auth";
const PASSWORD = process.env.APP_PASSWORD || "review2026";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes: review pages (/<slug>), login, static assets, auth API
  if (
    pathname === "/login" ||
    pathname === "/api/auth" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/robots.txt"
  ) {
    return NextResponse.next();
  }

  // Public: brand API for review pages (GET only)
  if (pathname === "/api/brands" && request.method === "GET") {
    return NextResponse.next();
  }

  // Admin routes need auth
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/")) {
    const auth = request.cookies.get(AUTH_COOKIE);
    if (auth?.value === PASSWORD) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/api/")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Everything else is a public review page (/<slug>)
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
