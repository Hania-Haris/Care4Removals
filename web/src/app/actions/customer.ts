"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { findToken } from "@/lib/data/customer-quote";
import { getSettings } from "@/lib/settings";
import { sendTransactionalEmail } from "@/lib/email/send";
import type { QuoteStatus } from "@/lib/types";

export type CustomerResponse = "accept" | "decline" | "request-changes";
export type CustomerActionResult = { ok: boolean; message: string };

const FINALISED: QuoteStatus[] = [
  "accepted",
  "declined",
  "converted-to-job",
  "expired",
];

/**
 * Idempotent, replay-safe customer response. Guards against:
 *  - expired / revoked tokens
 *  - already-finalised quotes (accepted/declined/converted/expired)
 *  - accepting without acknowledging terms
 * Records the exact version responded to, a timestamp, and coarse request
 * metadata (IP, user-agent) for evidence — not presented as an e-signature.
 */
export async function respondToQuote(
  token: string,
  response: CustomerResponse,
  termsAcknowledged: boolean,
  message?: string
): Promise<CustomerActionResult> {
  const tok = await findToken(token);
  if (!tok || tok.revoked) {
    return { ok: false, message: "This link is no longer valid." };
  }
  if (tok.expiresAt && tok.expiresAt.toMillis() < Date.now()) {
    return { ok: false, message: "This quotation has expired." };
  }

  if (response === "accept" && !termsAcknowledged) {
    return {
      ok: false,
      message: "Please tick the box to acknowledge the terms before accepting.",
    };
  }

  const db = getAdminDb();
  const ref = db.collection("quotes").doc(tok.quoteId);

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    "unknown";
  const ua = hdrs.get("user-agent")?.slice(0, 300) ?? "unknown";

  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return { ok: false, message: "Quote not found." };
    const q = snap.data()!;
    const status = q.status as QuoteStatus;

    if (FINALISED.includes(status)) {
      // Idempotent: if it's already in the state this response would produce,
      // treat as success rather than an error.
      if (response === "accept" && status === "accepted")
        return { ok: true, message: "You've already accepted this quotation." };
      if (response === "decline" && status === "declined")
        return { ok: true, message: "You've already declined this quotation." };
      return {
        ok: false,
        message: `This quotation is ${status} and can no longer be responded to.`,
      };
    }
    if (!q.currentVersionId) {
      return { ok: false, message: "This quotation isn't ready yet." };
    }

    const nextStatus: QuoteStatus =
      response === "accept"
        ? "accepted"
        : response === "decline"
          ? "declined"
          : "changes-requested";

    tx.update(ref, {
      status: nextStatus,
      customerRespondedAt: FieldValue.serverTimestamp(),
      customerRespondedVersionId: q.currentVersionId,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const activityRef = db.collection("activities").doc();
    tx.set(activityRef, {
      entityType: "quote",
      entityId: tok.quoteId,
      type: "quote-response",
      actor: "customer",
      metadata: {
        response,
        versionId: q.currentVersionId,
        termsAcknowledged: response === "accept" ? true : termsAcknowledged,
        message: message?.slice(0, 2000) ?? null,
        ip,
        ua,
      },
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      ok: true,
      message:
        response === "accept"
          ? "Thank you — your quotation is accepted. We'll be in touch to confirm the details."
          : response === "decline"
            ? "Thanks for letting us know. Your quotation has been declined."
            : "Thanks — we've received your change request and will get back to you.",
      leadId: q.leadId as string | undefined,
      nextStatus,
    };
  });

  if (result.ok && "leadId" in result && result.leadId) {
    // Nudge the lead + notify staff (best-effort).
    await db
      .collection("leads")
      .doc(result.leadId)
      .update({
        status: result.nextStatus === "accepted" ? "won" : "quote-sent",
        updatedAt: FieldValue.serverTimestamp(),
      })
      .catch(() => {});

    const settings = await getSettings();
    await sendTransactionalEmail({
      to: settings.emailRecipientAddress,
      from: settings.emailSenderAddress,
      subject: `Quote ${response} — customer response`,
      html: `<p>A customer has <strong>${response}</strong> their quotation.</p>`,
      text: `A customer has ${response} their quotation. Quote ${tok.quoteId}.`,
      entityType: "quote",
      entityId: tok.quoteId,
      templateType: "customer-response-notification",
    }).catch(() => {});
  }

  revalidatePath(`/quote/${token}`);
  revalidatePath(`/admin/quotes/${tok.quoteId}`);
  return { ok: result.ok, message: result.message };
}
