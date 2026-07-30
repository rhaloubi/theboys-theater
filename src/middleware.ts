import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/browse",
  "/watch",
  "/community",
  "/compare",
  "/profile",
  "/title",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const session = request.cookies.get("tbt_session")?.value;
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("next", pathname);
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
  ],
};
