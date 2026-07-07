import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const USER_PROTECTED = ["/dashboard", "/submit", "/tasks", "/billing", "/settings", "/support"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("gir_session");

  const isAdminLogin = pathname === "/admin/login";
  const isAdminArea =
    pathname === "/admin" || (pathname.startsWith("/admin/") && !isAdminLogin);

  if (isAdminArea && !hasSession) {
    const login = new URL("/admin/login", request.url);
    return NextResponse.redirect(login);
  }

  const isUserProtected = USER_PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isUserProtected && !hasSession) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/submit/:path*",
    "/tasks/:path*",
    "/billing/:path*",
    "/settings/:path*",
    "/support/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
