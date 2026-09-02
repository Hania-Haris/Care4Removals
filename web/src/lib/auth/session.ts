import "server-only";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";
import type { UserRole } from "@/lib/types";
import { SESSION_COOKIE } from "./constants";

export { SESSION_COOKIE };

export type SessionUser = {
  uid: string;
  email: string;
  role: UserRole;
};

const STAFF_ROLES: UserRole[] = ["admin", "manager", "staff", "viewer"];
const WRITE_ROLES: UserRole[] = ["admin", "manager", "staff"];

/**
 * Verifies the session cookie server-side and returns the staff user, or null.
 * The role comes from the token's custom claim — never from anything the
 * client can set. Returns null (rather than throwing) for every failure mode
 * so callers can just redirect.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const cookie = jar.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;

  try {
    const decoded = await getAdminAuth().verifySessionCookie(cookie, true);
    const role = decoded.role as UserRole | undefined;

    if (!role || !STAFF_ROLES.includes(role)) return null;
    if (!decoded.email) return null;

    return { uid: decoded.uid, email: decoded.email, role };
  } catch {
    return null;
  }
}

export async function requireStaff(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export function canWrite(role: UserRole): boolean {
  return WRITE_ROLES.includes(role);
}
