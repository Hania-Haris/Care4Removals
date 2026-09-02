"use server";

import { revalidatePath } from "next/cache";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { requireStaff, canWrite } from "@/lib/auth/session";
import { getQuoteVersion } from "@/lib/data/quotes";
import { JOB_TRANSITIONS } from "@/lib/data/job-constants";
import type { JobStatus, QuoteStatus } from "@/lib/types";

export type JobActionResult = { ok: boolean; message: string; jobId?: string };

/**
 * Converts an accepted quote into a job. Idempotent — a quote can only ever
 * produce one job (enforced in a transaction on the quote's status flip to
 * "converted-to-job"). The job stores a frozen snapshot of the accepted
 * version, so later quote edits can't rewrite history.
 */
export async function convertQuoteToJob(
  quoteId: string
): Promise<JobActionResult> {
  let user;
  try {
    user = await requireStaff();
    if (!canWrite(user.role)) throw new Error("FORBIDDEN");
  } catch {
    return { ok: false, message: "Not authorised." };
  }

  const db = getAdminDb();
  const quoteRef = db.collection("quotes").doc(quoteId);

  // Guard + reserve inside a transaction.
  const pre = await db.runTransaction(async (tx) => {
    const snap = await tx.get(quoteRef);
    if (!snap.exists) return { ok: false as const, message: "Quote not found." };
    const q = snap.data()!;
    const status = q.status as QuoteStatus;

    if (status === "converted-to-job") {
      return { ok: false as const, message: "Already converted.", already: true };
    }
    if (status !== "accepted") {
      return {
        ok: false as const,
        message: "Only an accepted quote can be converted to a job.",
      };
    }
    if (!q.currentVersionId) {
      return { ok: false as const, message: "No accepted version to snapshot." };
    }

    tx.update(quoteRef, {
      status: "converted-to-job" as QuoteStatus,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      ok: true as const,
      message: "reserved",
      leadId: q.leadId as string,
      versionId: (q.customerRespondedVersionId ??
        q.currentVersionId) as string,
      customerName: q.customerName ?? "",
      customerEmail: q.customerEmail ?? "",
    };
  });

  if (!pre.ok) {
    if ("already" in pre && pre.already) {
      const existing = await db
        .collection("jobs")
        .where("quoteId", "==", quoteId)
        .limit(1)
        .get();
      return {
        ok: true,
        message: "This quote was already converted.",
        jobId: existing.empty ? undefined : existing.docs[0]!.id,
      };
    }
    return { ok: false, message: pre.message };
  }

  // Build the frozen snapshot from the accepted version + lead.
  const [version, leadSnap] = await Promise.all([
    getQuoteVersion(pre.versionId),
    db.collection("leads").doc(pre.leadId).get(),
  ]);
  const lead = leadSnap.data() ?? {};

  const jobRef = db.collection("jobs").doc();
  await jobRef.set({
    quoteId,
    quoteVersionId: pre.versionId,
    leadId: pre.leadId,
    customerId: null,
    status: "pending-confirmation" as JobStatus,
    snapshot: {
      customerName: pre.customerName,
      customerEmail: pre.customerEmail,
      customerPhone: lead.phone ?? "",
      pickupAddress: lead.pickupAddress ?? "",
      deliveryAddress: lead.deliveryAddress ?? "",
      movingDate: lead.movingDate ?? null,
      serviceType: lead.serviceType ?? null,
      total: version?.total ?? 0,
      lineItems: version?.lineItems ?? [],
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await db.collection("leads").doc(pre.leadId).update({
    status: "won",
    updatedAt: FieldValue.serverTimestamp(),
  });

  await db.collection("activities").add({
    entityType: "quote",
    entityId: quoteId,
    type: "converted",
    actor: user.uid,
    metadata: { jobId: jobRef.id },
    createdAt: FieldValue.serverTimestamp(),
  });
  await db.collection("activities").add({
    entityType: "job",
    entityId: jobRef.id,
    type: "created",
    actor: user.uid,
    metadata: { fromQuote: quoteId },
    createdAt: FieldValue.serverTimestamp(),
  });

  revalidatePath(`/admin/quotes/${quoteId}`);
  revalidatePath(`/admin/jobs/${jobRef.id}`);
  return { ok: true, message: "Job created.", jobId: jobRef.id };
}

export async function updateJobStatus(
  jobId: string,
  next: JobStatus
): Promise<JobActionResult> {
  let user;
  try {
    user = await requireStaff();
    if (!canWrite(user.role)) throw new Error("FORBIDDEN");
  } catch {
    return { ok: false, message: "Not authorised." };
  }

  const db = getAdminDb();
  const ref = db.collection("jobs").doc(jobId);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, message: "Job not found." };

  const current = (snap.data()?.status as JobStatus) ?? "pending-confirmation";
  if (!JOB_TRANSITIONS[current]?.includes(next)) {
    return { ok: false, message: `Can't move a job from "${current}" to "${next}".` };
  }

  await ref.update({ status: next, updatedAt: FieldValue.serverTimestamp() });
  await db.collection("activities").add({
    entityType: "job",
    entityId: jobId,
    type: "status-changed",
    actor: user.uid,
    metadata: { from: current, to: next },
    createdAt: FieldValue.serverTimestamp(),
  });

  revalidatePath(`/admin/jobs/${jobId}`);
  return { ok: true, message: "Job status updated." };
}
