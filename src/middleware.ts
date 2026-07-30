import { NextResponse, type NextRequest } from "next/server";
import { PROFILE_COOKIE, SESSION_COOKIE } from "@/lib/auth/cookies";

const APP_PREFIXES = [
  "/browse",
  "/watch",
  "/community",
  "/compare",
  "/profile",
  "/title",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  const profile = request.cookies.get(PROFILE_COOKIE)?.value;

  if (pathname.startsWith("/gate/select-user")) {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const isAppRoute = APP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isAppRoute) {
    return NextResponse.next();
  }

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (!profile) {
    const url = request.nextUrl.clone();
    url.pathname = "/gate/select-user";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/browse/:path*",
    "/watch/:path*",
    "/community/:path*",
    "/compare/:path*",
    "/profile/:path*",
    "/title/:path*",
    "/gate/select-user",
  ],
};
