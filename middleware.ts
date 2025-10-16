import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/favicon.svg",
  "/vercel.svg",
  "/next.svg",
  "/window.svg",
  "/globe.svg",
  "/file.svg",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow Next internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next();
  }

  // 🟢 Skip authentication completely if env var is enabled
  const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH === "true";
  if (skipAuth) {
    return NextResponse.next();
  }

  // Public routes
  if (PUBLIC_PATHS.includes(pathname)) {
    const token = req.cookies.get("token")?.value;
    if (token && (pathname === "/login" || pathname === "/signup")) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Protected routes (only when skipAuth is false)
  const token = req.cookies.get("token")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + (req.nextUrl.search || ""));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// ✅ Only protect specific routes, not everything
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"], // update for your app
};
