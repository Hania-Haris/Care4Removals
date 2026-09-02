import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";

// Fast, cookie-presence-only gate at the edge. Full cryptographic verification
// of the session happens in the (protected) layout / server actions via the
// Admin SDK — middleware runs on the Edge runtime and can't use it. This just
// avoids rendering the protected shell at all for obviously-unauthenticated
// requests and keeps a stray /admin link from flashing protected UI.
export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedAdmin =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  if (isProtectedAdmin && !req.cookies.get(SESSION_COOKIE)) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
