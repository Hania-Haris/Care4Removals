"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { requireStaff, canWrite } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings";
import { calculateQuote, type RawLineItem, type VatMode } from "@/lib/quote/calc";
import { createQuoteFromLead } from "@/lib/data/quotes";
import type { QuoteStatus } from "@/lib/types";

export type QuoteActionResult = {
  ok: boolean;
  message: string;
  quoteId?: string;
};

async function requireWriter() {
  const user = await requireStaff();
  if (!canWrite(user.role)) throw new Error("FORBIDDEN");
  return user;
}

// ---- create a quote from a qualified lead ----
export async function startQuoteForLead(
  leadId: string
): Promise<QuoteActionResult> {
  let user;
  try {
    user = await requireWriter();
  } catch {
    return { ok: false, message: "Not authorised." };
  }

  const db = getAdminDb();
  const existing = await db
    .collection("quotes")
    .where("leadId", "==", leadId)
    .limit(1)
    .get();
  if (!existing.empty) {
    return {
      ok: true,
      message: "Quote already exists for this lead.",
      quoteId: existing.docs[0]!.id,
    };
  }

  const settings = await getSettings();
  try {
    const { quoteId } = await createQuoteFromLead({
      leadId,
      createdBy: user.uid,
      quoteValidityDays: settings.quoteValidityDays,
    });
    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath("/admin/leads");
    return { ok: true, message: "Quote created.", quoteId };
  } catch (e) {
    console.error("startQuoteForLead:", e);
    return { ok: false, message: "Could not create the quote." };
  }
}

// ---- save the editable draft (mutable until sent) ----
export type DraftInput = {
  lineItems: RawLineItem[];
  assumptions: string;
  exclusions: string;
  paymentTerms: string;
  cancellationTerms: string;
  overrideReason?: string;
};

export async function saveQuoteDraft(
  quoteId: string,
  draft: DraftInput
): Promise<QuoteActionResult> {
  let user;
  try {
    user = await requireWriter();
  } catch {
    return { ok: false, message: "Not authorised." };
  }

  const db = getAdminDb();
  const ref = db.collection("quotes").doc(quoteId);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, message: "Quote not found." };

  const status = (snap.data()?.status as QuoteStatus) ?? "draft";
  if (["accepted", "converted-to-job", "declined"].includes(status)) {
    return {
      ok: false,
      message: `A ${status} quote can't be edited.`,
    };
  }

  const settings = await getSettings();
  const totals = calculateQuote(
    draft.lineItems,
    settings.vatMode as VatMode
  );

  // Manual override => reason required + audited.
  const overrideReason = draft.overrideReason?.trim() || null;

  await ref.update({
    draftLineItems: totals.lineItems,
    draftSubtotal: totals.subtotal,
    draftTax: totals.tax,
    draftTotal: totals.total,
    draftVatMode: settings.vatMode,
    draftAssumptions: draft.assumptions.trim(),
    draftExclusions: draft.exclusions.trim(),
    draftPaymentTerms: draft.paymentTerms.trim(),
    draftCancellationTerms: draft.cancellationTerms.trim(),
    draftOverrideReason: overrideReason,
    updatedAt: FieldValue.serverTimestamp(),
  });

  if (overrideReason) {
    await db.collection("activities").add({
      entityType: "quote",
      entityId: quoteId,
      type: "price-override",
      actor: user.uid,
      metadata: { reason: overrideReason, total: totals.total },
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  revalidatePath(`/admin/quotes/${quoteId}`);
  return { ok: true, message: "Draft saved." };
}

export async function setQuoteStatus(
  quoteId: string,
  next: Extract<QuoteStatus, "draft" | "ready-for-review">
): Promise<QuoteActionResult> {
  try {
    await requireWriter();
  } catch {
    return { ok: false, message: "Not authorised." };
  }
  await getAdminDb().collection("quotes").doc(quoteId).update({
    status: next,
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidatePath(`/admin/quotes/${quoteId}`);
  return { ok: true, message: "Status updated." };
}

// ---- send: snapshot an immutable version, issue a customer token ----
export async function sendQuote(quoteId: string): Promise<QuoteActionResult> {
  let user;
  try {
    user = await requireWriter();
  } catch {
    return { ok: false, message: "Not authorised." };
  }

  const db = getAdminDb();
  const ref = db.collection("quotes").doc(quoteId);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, message: "Quote not found." };
  const q = snap.data()!;

  if (!q.draftLineItems || (q.draftLineItems as unknown[]).length === 0) {
    return { ok: false, message: "Add at least one line item first." };
  }

  const settings = await getSettings();
  if (settings.managerReviewRequired && q.status !== "ready-for-review") {
    return {
      ok: false,
      message: "This quote needs manager review before it can be sent.",
    };
  }

  // Next immutable version number
  const versionsSnap = await db
    .collection("quoteVersions")
    .where("quoteId", "==", quoteId)
    .orderBy("versionNumber", "desc")
    .limit(1)
    .get();
  const lastVersion = versionsSnap.empty
    ? 0
    : (versionsSnap.docs[0]!.data().versionNumber as number);
  const versionNumber = lastVersion + 1;

  const versionRef = db.collection("quoteVersions").doc();
  await versionRef.set({
    quoteId,
    versionNumber,
    lineItems: q.draftLineItems,
    subtotal: q.draftSubtotal ?? 0,
    tax: q.draftTax ?? 0,
    total: q.draftTotal ?? 0,
    vatMode: q.draftVatMode ?? settings.vatMode,
    assumptions: q.draftAssumptions ?? "",
    exclusions: q.draftExclusions ?? "",
    paymentTerms: q.draftPaymentTerms ?? "",
    cancellationTerms: q.draftCancellationTerms ?? settings.termsText,
    overrideReason: q.draftOverrideReason ?? null,
    pdfStoragePath: null, // Phase 7 fills this
    issuedAt: FieldValue.serverTimestamp(),
    createdBy: user.uid,
    createdAt: FieldValue.serverTimestamp(),
  });

  // Fresh customer token: cryptographically random, not derived from any id.
  const token = randomBytes(32).toString("base64url");
  const tokenExpiry = new Date(
    Date.now() + settings.quoteValidityDays * 86400_000
  );
  await db.collection("customerTokens").add({
    quoteId,
    token,
    expiresAt: tokenExpiry,
    revoked: false,
    createdAt: FieldValue.serverTimestamp(),
  });

  await ref.update({
    status: "sent" as QuoteStatus,
    currentVersionId: versionRef.id,
    expiresAt: tokenExpiry,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await db.collection("leads").doc(q.leadId).update({
    status: "quote-sent",
    updatedAt: FieldValue.serverTimestamp(),
  });

  await db.collection("activities").add({
    entityType: "quote",
    entityId: quoteId,
    type: "quote-sent",
    actor: user.uid,
    metadata: { versionNumber, total: q.draftTotal ?? 0 },
    createdAt: FieldValue.serverTimestamp(),
  });

  // Phase 7 will: generate the PDF from this immutable version, email the
  // customer the secure link + PDF, and log to emailLogs. Not wired yet.

  revalidatePath(`/admin/quotes/${quoteId}`);
  return {
    ok: true,
    message: `Version ${versionNumber} issued. (Email + PDF delivery is Phase 7.)`,
  };
}
