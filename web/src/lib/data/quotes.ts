import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import type { QuoteStatus } from "@/lib/types";
import type { LineItem } from "@/lib/types";

export const QUOTE_STATUSES: QuoteStatus[] = [
  "draft",
  "ready-for-review",
  "sent",
  "viewed",
  "changes-requested",
  "accepted",
  "declined",
  "expired",
  "converted-to-job",
];

type ISODate = string | null;
function toIso(v: unknown): ISODate {
  if (v && typeof v === "object" && "toDate" in v) {
    return (v as { toDate(): Date }).toDate().toISOString();
  }
  return null;
}

export type QuoteRecord = {
  id: string;
  leadId: string;
  customerName: string;
  customerEmail: string;
  quoteNumber: string;
  status: QuoteStatus;
  currentVersionId: string | null;
  expiresAt: ISODate;
  createdBy: string;
  createdAt: ISODate;
  updatedAt: ISODate;
};

export type QuoteVersionRecord = {
  id: string;
  quoteId: string;
  versionNumber: number;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  vatMode: string;
  assumptions: string;
  exclusions: string;
  paymentTerms: string;
  cancellationTerms: string;
  overrideReason: string | null;
  pdfStoragePath: string | null;
  issuedAt: ISODate;
  createdBy: string;
  createdAt: ISODate;
};

/**
 * Allocates the next sequential quote number inside a transaction, so two
 * staff creating quotes at the same moment can't collide. Format: Q-00001.
 */
async function nextQuoteNumber(db: Firestore): Promise<string> {
  const counterRef = db.collection("counters").doc("quoteNumber");
  const n = await db.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const current = (snap.exists ? snap.data()?.value : 0) ?? 0;
    const next = current + 1;
    tx.set(counterRef, { value: next }, { merge: true });
    return next;
  });
  return `Q-${String(n).padStart(5, "0")}`;
}

export async function createQuoteFromLead(opts: {
  leadId: string;
  createdBy: string;
  quoteValidityDays: number;
}): Promise<{ quoteId: string }> {
  const db = getAdminDb();
  const leadSnap = await db.collection("leads").doc(opts.leadId).get();
  if (!leadSnap.exists) throw new Error("LEAD_NOT_FOUND");
  const lead = leadSnap.data()!;

  const quoteNumber = await nextQuoteNumber(db);
  const expiresAt = new Date(
    Date.now() + opts.quoteValidityDays * 86400_000
  );

  const quoteRef = db.collection("quotes").doc();
  await quoteRef.set({
    leadId: opts.leadId,
    customerName: lead.customerName ?? "",
    customerEmail: lead.email ?? "",
    quoteNumber,
    status: "draft" as QuoteStatus,
    currentVersionId: null,
    expiresAt,
    createdBy: opts.createdBy,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // The source lead is not overwritten — just linked and nudged forward.
  await db.collection("leads").doc(opts.leadId).update({
    status: "quote-in-preparation",
    updatedAt: FieldValue.serverTimestamp(),
  });

  await db.collection("activities").add({
    entityType: "quote",
    entityId: quoteRef.id,
    type: "created",
    actor: opts.createdBy,
    metadata: { quoteNumber, leadId: opts.leadId },
    createdAt: FieldValue.serverTimestamp(),
  });

  return { quoteId: quoteRef.id };
}

function mapQuote(
  doc: FirebaseFirestore.DocumentSnapshot
): QuoteRecord {
  const d = doc.data() ?? {};
  return {
    id: doc.id,
    leadId: d.leadId ?? "",
    customerName: d.customerName ?? "",
    customerEmail: d.customerEmail ?? "",
    quoteNumber: d.quoteNumber ?? "",
    status: (d.status as QuoteStatus) ?? "draft",
    currentVersionId: d.currentVersionId ?? null,
    expiresAt: toIso(d.expiresAt),
    createdBy: d.createdBy ?? "",
    createdAt: toIso(d.createdAt),
    updatedAt: toIso(d.updatedAt),
  };
}

export async function getQuote(id: string): Promise<QuoteRecord | null> {
  const snap = await getAdminDb().collection("quotes").doc(id).get();
  return snap.exists ? mapQuote(snap) : null;
}

export async function getQuoteByLead(
  leadId: string
): Promise<QuoteRecord | null> {
  const snap = await getAdminDb()
    .collection("quotes")
    .where("leadId", "==", leadId)
    .limit(1)
    .get();
  return snap.empty ? null : mapQuote(snap.docs[0]!);
}

function mapVersion(
  doc: FirebaseFirestore.DocumentSnapshot
): QuoteVersionRecord {
  const d = doc.data() ?? {};
  return {
    id: doc.id,
    quoteId: d.quoteId ?? "",
    versionNumber: d.versionNumber ?? 1,
    lineItems: (d.lineItems as LineItem[]) ?? [],
    subtotal: d.subtotal ?? 0,
    tax: d.tax ?? 0,
    total: d.total ?? 0,
    vatMode: d.vatMode ?? "none",
    assumptions: d.assumptions ?? "",
    exclusions: d.exclusions ?? "",
    paymentTerms: d.paymentTerms ?? "",
    cancellationTerms: d.cancellationTerms ?? "",
    overrideReason: d.overrideReason ?? null,
    pdfStoragePath: d.pdfStoragePath ?? null,
    issuedAt: toIso(d.issuedAt),
    createdBy: d.createdBy ?? "",
    createdAt: toIso(d.createdAt),
  };
}

export async function listQuoteVersions(
  quoteId: string
): Promise<QuoteVersionRecord[]> {
  const snap = await getAdminDb()
    .collection("quoteVersions")
    .where("quoteId", "==", quoteId)
    .orderBy("versionNumber", "desc")
    .get();
  return snap.docs.map(mapVersion);
}

export async function getQuoteVersion(
  id: string
): Promise<QuoteVersionRecord | null> {
  const snap = await getAdminDb().collection("quoteVersions").doc(id).get();
  return snap.exists ? mapVersion(snap) : null;
}
