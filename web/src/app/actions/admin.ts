"use server";

import { revalidatePath } from "next/cache";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { requireStaff, canWrite } from "@/lib/auth/session";
import { LEAD_TRANSITIONS } from "@/lib/data/leads";
import type { LeadStatus } from "@/lib/types";

export type AdminActionResult = { ok: boolean; message: string };

export async function updateLeadStatus(
  leadId: string,
  nextStatus: LeadStatus
): Promise<AdminActionResult> {
  let user;
  try {
    user = await requireStaff();
  } catch {
    return { ok: false, message: "Your session has expired. Please sign in again." };
  }
  if (!canWrite(user.role)) {
    return { ok: false, message: "Your role can't change lead status." };
  }

  const db = getAdminDb();
  const ref = db.collection("leads").doc(leadId);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, message: "Lead not found." };

  const current = (snap.data()?.status as LeadStatus) ?? "new";
  if (current === nextStatus) {
    return { ok: true, message: "No change." };
  }
  if (!LEAD_TRANSITIONS[current]?.includes(nextStatus)) {
    return {
      ok: false,
      message: `Can't move a lead from "${current}" to "${nextStatus}".`,
    };
  }

  await ref.update({
    status: nextStatus,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await db.collection("activities").add({
    entityType: "lead",
    entityId: leadId,
    type: "status-changed",
    actor: user.uid,
    metadata: { from: current, to: nextStatus },
    createdAt: FieldValue.serverTimestamp(),
  });

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
  revalidatePath("/admin/dashboard");
  return { ok: true, message: "Status updated." };
}

export async function assignLead(
  leadId: string,
  assigneeUid: string | null
): Promise<AdminActionResult> {
  let user;
  try {
    user = await requireStaff();
  } catch {
    return { ok: false, message: "Your session has expired. Please sign in again." };
  }
  if (!canWrite(user.role)) {
    return { ok: false, message: "Your role can't assign leads." };
  }

  const db = getAdminDb();
  await db.collection("leads").doc(leadId).update({
    assignedTo: assigneeUid,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await db.collection("activities").add({
    entityType: "lead",
    entityId: leadId,
    type: "assigned",
    actor: user.uid,
    metadata: { assignedTo: assigneeUid },
    createdAt: FieldValue.serverTimestamp(),
  });

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
  return { ok: true, message: "Assignment updated." };
}

export async function addInternalNote(
  leadId: string,
  note: string
): Promise<AdminActionResult> {
  let user;
  try {
    user = await requireStaff();
  } catch {
    return { ok: false, message: "Your session has expired. Please sign in again." };
  }
  if (!canWrite(user.role)) {
    return { ok: false, message: "Your role can't add notes." };
  }

  const trimmed = note.trim();
  if (!trimmed) return { ok: false, message: "Note is empty." };
  if (trimmed.length > 4000)
    return { ok: false, message: "Note is too long (4000 char max)." };

  const db = getAdminDb();

  // Internal notes are their own activity entries with type "note" — they
  // are NEVER copied into any customer-facing payload (see the customer
  // quote view in Phase 8, which only reads quoteVersion data).
  await db.collection("activities").add({
    entityType: "lead",
    entityId: leadId,
    type: "note",
    actor: user.uid,
    metadata: { text: trimmed, authorEmail: user.email },
    createdAt: FieldValue.serverTimestamp(),
  });

  revalidatePath(`/admin/leads/${leadId}`);
  return { ok: true, message: "Note added." };
}

export async function logContactActivity(
  leadId: string,
  kind: "call" | "email",
  summary: string
): Promise<AdminActionResult> {
  let user;
  try {
    user = await requireStaff();
  } catch {
    return { ok: false, message: "Your session has expired. Please sign in again." };
  }
  if (!canWrite(user.role)) {
    return { ok: false, message: "Your role can't log activity." };
  }

  const trimmed = summary.trim();
  if (!trimmed) return { ok: false, message: "Summary is empty." };

  const db = getAdminDb();

  // Records that a call/email happened, with a staff-written summary. It does
  // NOT compose or send anything — nothing here is presented as a message
  // actually sent to the customer.
  await db.collection("activities").add({
    entityType: "lead",
    entityId: leadId,
    type: kind === "call" ? "call-logged" : "email-logged",
    actor: user.uid,
    metadata: { summary: trimmed, authorEmail: user.email },
    createdAt: FieldValue.serverTimestamp(),
  });

  revalidatePath(`/admin/leads/${leadId}`);
  return { ok: true, message: `${kind === "call" ? "Call" : "Email"} logged.` };
}
