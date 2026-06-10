import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/submit", "/tasks", "/billing", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!isProtected) return NextResponse.next();

  const hasSession = request.cookies.has("gir_session");
  if (!hasSession) {
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
  ],
};
