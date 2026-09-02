import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import type { QuoteVersionRecord } from "@/lib/data/quotes";
import { getQuoteVersion } from "@/lib/data/quotes";
import type { QuoteStatus } from "@/lib/types";

// The ONLY server-side path by which customer-facing quote data is exposed.
// The browser never queries Firestore for any of this — it hits a server
// component / server action that calls through here with the opaque token.

export type CustomerQuoteView = {
  quoteId: string;
  quoteNumber: string;
  customerName: string;
  status: QuoteStatus;
  expiresAt: string | null;
  expired: boolean;
  respondable: boolean;
  hasPdf: boolean;
  // Only safe, customer-facing fields from the immutable version — no
  // internal notes, cost, margin, staff identity, or unrelated records.
  version: {
    versionNumber: number;
    lineItems: { description: string; category: string; quantity: number; unitPrice: number; total: number }[];
    subtotal: number;
    tax: number;
    total: number;
    vatMode: string;
    assumptions: string;
    exclusions: string;
    paymentTerms: string;
    cancellationTerms: string;
  } | null;
};

type TokenDoc = {
  id: string;
  quoteId: string;
  expiresAt: FirebaseFirestore.Timestamp | null;
  revoked: boolean;
};

async function findToken(token: string): Promise<TokenDoc | null> {
  if (!token || token.length < 20) return null;
  let snap;
  try {
    snap = await getAdminDb()
      .collection("customerTokens")
      .where("token", "==", token)
      .limit(1)
      .get();
  } catch (e) {
    // Admin SDK not configured (local dev) or transient error — treat as
    // "no such token" rather than 500ing the customer page.
    console.error("findToken failed:", e);
    return null;
  }
  if (snap.empty) return null;
  const d = snap.docs[0]!;
  return {
    id: d.id,
    quoteId: d.data().quoteId,
    expiresAt: d.data().expiresAt ?? null,
    revoked: !!d.data().revoked,
  };
}

const FINALISED: QuoteStatus[] = [
  "accepted",
  "declined",
  "converted-to-job",
  "expired",
];

/**
 * Returns the customer-safe view for a token, or null for any failure
 * (not found, revoked, malformed). Expiry is surfaced on the view (so the
 * customer sees "this quote has expired") rather than as a hard null.
 */
export async function getCustomerQuoteView(
  token: string
): Promise<CustomerQuoteView | null> {
  const tok = await findToken(token);
  if (!tok || tok.revoked) return null;

  const db = getAdminDb();
  const quoteSnap = await db.collection("quotes").doc(tok.quoteId).get();
  if (!quoteSnap.exists) return null;
  const q = quoteSnap.data()!;

  const now = Date.now();
  const expMs = tok.expiresAt ? tok.expiresAt.toMillis() : null;
  const expired =
    (expMs !== null && expMs < now) || q.status === "expired";

  // Always show the latest issued version.
  const version: QuoteVersionRecord | null = q.currentVersionId
    ? await getQuoteVersion(q.currentVersionId)
    : null;

  const respondable =
    !expired &&
    !FINALISED.includes(q.status as QuoteStatus) &&
    !!version;

  return {
    quoteId: tok.quoteId,
    quoteNumber: q.quoteNumber ?? "",
    customerName: q.customerName ?? "",
    status: q.status as QuoteStatus,
    expiresAt: expMs ? new Date(expMs).toISOString() : null,
    expired,
    respondable,
    hasPdf: !!version?.pdfStoragePath,
    version: version
      ? {
          versionNumber: version.versionNumber,
          lineItems: version.lineItems,
          subtotal: version.subtotal,
          tax: version.tax,
          total: version.total,
          vatMode: version.vatMode,
          assumptions: version.assumptions,
          exclusions: version.exclusions,
          paymentTerms: version.paymentTerms,
          cancellationTerms: version.cancellationTerms,
        }
      : null,
  };
}

/** Records a first view (idempotent-ish: only flips sent -> viewed once). */
export async function recordQuoteViewed(token: string): Promise<void> {
  const tok = await findToken(token);
  if (!tok || tok.revoked) return;
  const db = getAdminDb();
  const ref = db.collection("quotes").doc(tok.quoteId);
  const snap = await ref.get();
  if (snap.data()?.status !== "sent") return;

  await ref.update({
    status: "viewed",
    updatedAt: FieldValue.serverTimestamp(),
  });
  await db.collection("activities").add({
    entityType: "quote",
    entityId: tok.quoteId,
    type: "quote-viewed",
    actor: "customer",
    metadata: {},
    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function getPdfPathForToken(
  token: string
): Promise<string | null> {
  const tok = await findToken(token);
  if (!tok || tok.revoked) return null;
  if (tok.expiresAt && tok.expiresAt.toMillis() < Date.now()) return null;

  const q = await getAdminDb().collection("quotes").doc(tok.quoteId).get();
  const versionId = q.data()?.currentVersionId;
  if (!versionId) return null;
  const version = await getQuoteVersion(versionId);
  return version?.pdfStoragePath ?? null;
}

export { findToken };
