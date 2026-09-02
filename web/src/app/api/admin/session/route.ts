import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import type { UserRole } from "@/lib/types";

const FIVE_DAYS_MS = 60 * 60 * 24 * 5 * 1000;
const STAFF_ROLES: UserRole[] = ["admin", "manager", "staff", "viewer"];

// POST: exchange a freshly-minted Firebase ID token for an httpOnly session
// cookie. Rejects any user without a staff `role` custom claim — a valid
// Firebase account alone is not enough to get an admin session.
export async function POST(req: NextRequest) {
  let idToken: string;
  try {
    ({ idToken } = await req.json());
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!idToken) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(idToken, true);
    const role = decoded.role as UserRole | undefined;

    if (!role || !STAFF_ROLES.includes(role)) {
      return NextResponse.json(
        { error: "This account does not have staff access." },
        { status: 403 }
      );
    }

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: FIVE_DAYS_MS,
    });

    const res = NextResponse.json({ ok: true, role });
    res.cookies.set(SESSION_COOKIE, sessionCookie, {
      maxAge: FIVE_DAYS_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return res;
  } catch (error) {
    console.error("session POST failed:", error);
    return NextResponse.json(
      { error: "Could not create a session. Please try again." },
      { status: 401 }
    );
  }
}

// DELETE: sign out — clear the cookie.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
