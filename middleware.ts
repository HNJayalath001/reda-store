import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes entirely
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Skip static files
  if (pathname.startsWith("/_next/") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const hasToken = !!request.cookies.get("admin_token")?.value;

  // Login/register: redirect to dashboard if already has token
  if (pathname === "/admin/login" || pathname === "/admin/register") {
    if (hasToken) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // All other /admin routes: require token
  if (pathname.startsWith("/admin")) {
    if (!hasToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
