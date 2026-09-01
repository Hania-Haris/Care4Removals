"use server";

import { headers } from "next/headers";
import { revalidateTag } from "next/cache";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import {
  quoteFormSchema,
  contactFormSchema,
} from "@/lib/validation/lead";
import { notifyNewLead } from "@/lib/email/notify";
import { checkPublicSubmissionRate } from "@/lib/rate-limit";

async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

export type ActionResult = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string>;
  // Submitted values echoed back so the client can repopulate the form after
  // a validation error (React 19 form actions auto-reset the form otherwise).
  // Never populated on success.
  values?: Record<string, string>;
};

function collectValues(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (typeof v === "string" && k !== "submissionId") out[k] = v;
  }
  return out;
}

/**
 * Turns a raw FormData submission into a lead document. Server validation is
 * authoritative — the client-side schema is the same shape but a bad actor
 * bypassing the browser entirely still hits this. Idempotent via
 * `submissionId`: a duplicate submit (double-click, network retry) with the
 * same id is recognized and short-circuited instead of creating a second
 * lead in Firestore.
 */
export async function submitQuoteLead(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = quoteFormSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors,
      values: collectValues(formData),
    };
  }

  const data = parsed.data;

  const rate = await checkPublicSubmissionRate(await clientIp());
  if (!rate.allowed) {
    return { status: "error", message: rate.reason, values: collectValues(formData) };
  }

  try {
    const db = getAdminDb();
    const leadsRef = db.collection("leads");

    // Idempotency check
    const existing = await leadsRef
      .where("submissionId", "==", data.submissionId)
      .limit(1)
      .get();

    if (!existing.empty) {
      const doc = existing.docs[0]!;
      return {
        status: "success",
        message: `Thank you! Your removal enquiry has been received. Reference: ${doc.id.slice(0, 8).toUpperCase()}`,
      };
    }

    const docRef = await leadsRef.add({
      customerName: data.customerName,
      email: data.email,
      phone: data.phone,
      pickupAddress: data.pickupAddress,
      pickupPropertyType: data.pickupPropertyType,
      pickupGroundFloor: data.pickupGroundFloor || null,
      deliveryAddress: data.deliveryAddress,
      deliveryPropertyType: data.deliveryPropertyType,
      deliveryGroundFloor: data.deliveryGroundFloor || null,
      movingDate: data.movingDate || null,
      serviceType: data.serviceType || null,
      specialInstructions: data.specialInstructions || null,
      submissionId: data.submissionId,
      source: "quote-form",
      status: "new",
      priority: "normal",
      assignedTo: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await db.collection("activities").add({
      entityType: "lead",
      entityId: docRef.id,
      type: "created",
      actor: "system",
      metadata: { source: "quote-form" },
      createdAt: FieldValue.serverTimestamp(),
    });

    const reference = docRef.id.slice(0, 8).toUpperCase();
    await notifyNewLead({
      leadId: docRef.id,
      customerName: data.customerName,
      customerEmail: data.email,
      source: "quote-form",
      summary: `${data.pickupAddress} -> ${data.deliveryAddress}\nDate: ${data.movingDate || "flexible"} | Service: ${data.serviceType || "not specified"}`,
      reference,
    });

    revalidateTag("leads", { expire: 0 });


    return {
      status: "success",
      message: `Thank you! Your removal enquiry has been received. Reference: ${reference}. Our team will be in touch shortly.`,
    };
  } catch (error) {
    console.error("submitQuoteLead failed:", error);
    return {
      status: "error",
      message:
        "Sorry, we couldn't submit your request. Please try again or contact us directly.",
      values: collectValues(formData),
    };
  }
}

export async function submitContactMessage(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = contactFormSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors,
      values: collectValues(formData),
    };
  }

  const data = parsed.data;

  const rate = await checkPublicSubmissionRate(await clientIp());
  if (!rate.allowed) {
    return { status: "error", message: rate.reason, values: collectValues(formData) };
  }

  try {
    const db = getAdminDb();
    const leadsRef = db.collection("leads");

    const existing = await leadsRef
      .where("submissionId", "==", data.submissionId)
      .limit(1)
      .get();

    if (!existing.empty) {
      return {
        status: "success",
        message: "Thanks — your message has been received. We'll be in touch.",
      };
    }

    const docRef = await leadsRef.add({
      customerName: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
      submissionId: data.submissionId,
      source: "contact-form",
      status: "new",
      priority: "normal",
      assignedTo: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await db.collection("activities").add({
      entityType: "lead",
      entityId: docRef.id,
      type: "created",
      actor: "system",
      metadata: { source: "contact-form" },
      createdAt: FieldValue.serverTimestamp(),
    });

    await notifyNewLead({
      leadId: docRef.id,
      customerName: data.name,
      customerEmail: data.email,
      source: "contact-form",
      summary: `Subject: ${data.subject}\n\n${data.message}`,
      reference: docRef.id.slice(0, 8).toUpperCase(),
    });

    revalidateTag("leads", { expire: 0 });


    return {
      status: "success",
      message: "Thanks — your message has been received. We'll be in touch.",
    };
  } catch (error) {
    console.error("submitContactMessage failed:", error);
    return {
      status: "error",
      message:
        "Sorry, we couldn't send your message. Please try again or contact us directly.",
      values: collectValues(formData),
    };
  }
}
