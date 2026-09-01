import "server-only";
import { createHash } from "crypto";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

// Firestore-backed rate limiting for the PUBLIC forms — the one place an
// attacker can drive unbounded writes + emails. Costs 1 read + 1 write per
// submission attempt (negligible), and hard-caps the damage: a scripted
// flood hits the global daily ceiling and every further request is a single
// cheap read that returns "blocked".
//
// Counters live in `rateLimits/{key}` and are only ever incremented; a tiny
// scheduled cleanup can prune them later, or just leave them (a few bytes
// each).

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function dayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
function hourKey(d = new Date()): string {
  return d.toISOString().slice(0, 13);
}

export type RateLimitVerdict =
  | { allowed: true }
  | { allowed: false; reason: string };

const LIMITS = {
  perIpPerHour: 4,
  perIpPerDay: 12,
  globalPerDay: 250, // well under any plausible real volume; protects the bill
};

/**
 * Checks + records a public form submission against per-IP and global
 * ceilings. Fail-open on infra error (don't block a real customer because
 * Firestore hiccuped) EXCEPT the global cap, which fails closed if we can't
 * read it.
 */
export async function checkPublicSubmissionRate(
  ip: string
): Promise<RateLimitVerdict> {
  const db = getAdminDb();
  const iph = hashIp(ip || "unknown");
  const now = new Date();

  const globalRef = db.collection("rateLimits").doc(`global:${dayKey(now)}`);
  const ipDayRef = db
    .collection("rateLimits")
    .doc(`ip:${iph}:${dayKey(now)}`);
  const ipHourRef = db
    .collection("rateLimits")
    .doc(`ip:${iph}:${hourKey(now)}`);

  try {
    const [g, d, h] = await db.getAll(globalRef, ipDayRef, ipHourRef);
    const gc = (g.data()?.count as number) ?? 0;
    const dc = (d.data()?.count as number) ?? 0;
    const hc = (h.data()?.count as number) ?? 0;

    if (gc >= LIMITS.globalPerDay) {
      return {
        allowed: false,
        reason:
          "We're receiving a high volume of enquiries right now. Please try again later or email us directly.",
      };
    }
    if (hc >= LIMITS.perIpPerHour || dc >= LIMITS.perIpPerDay) {
      return {
        allowed: false,
        reason:
          "You've submitted several enquiries recently. Please wait a little while, or email us directly.",
      };
    }

    // Record the attempt (best-effort).
    const batch = db.batch();
    batch.set(
      globalRef,
      { count: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
    batch.set(
      ipDayRef,
      { count: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
    batch.set(
      ipHourRef,
      { count: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
    await batch.commit();

    return { allowed: true };
  } catch (e) {
    console.error("rate-limit check failed (allowing):", e);
    return { allowed: true }; // fail-open on infra error
  }
}
