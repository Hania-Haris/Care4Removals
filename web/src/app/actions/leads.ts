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
import { getAdminStorage } from "@/lib/firebase/admin";
import {
  UPLOAD_MAX_FILES,
  UPLOAD_MAX_BYTES,
  UPLOAD_ALLOWED,
} from "@/lib/validation/lead";

type UploadedFile = {
  path: string;
  name: string;
  size: number;
  contentType: string;
};

/**
 * Uploads the quote form's optional inventory photos to protected Storage
 * under leads/{leadId}/. Silently skips anything oversized, wrong-type, or
 * beyond the file-count cap — a bad file must never fail the whole enquiry.
 */
async function handleLeadUploads(
  leadId: string,
  formData: FormData
): Promise<UploadedFile[]> {
  const files = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, UPLOAD_MAX_FILES);
  if (files.length === 0) return [];

  const bucket = getAdminStorage().bucket();
  const out: UploadedFile[] = [];

  for (const file of files) {
    if (file.size > UPLOAD_MAX_BYTES) continue;
    if (!UPLOAD_ALLOWED.includes(file.type)) continue;
    try {
      const buf = Buffer.from(await file.arrayBuffer());
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
      const path = `leads/${leadId}/${Date.now()}-${safeName}`;
      await bucket.file(path).save(buf, {
        contentType: file.type,
        resumable: false,
        metadata: { cacheControl: "private, max-age=0" },
      });
      out.push({
        path,
        name: safeName,
        size: file.size,
        contentType: file.type,
      });
    } catch (e) {
      console.error("lead upload failed for", file.name, e);
    }
  }
  return out;
}

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

    const clean = (v: string) => v.trim() || null;
    const docRef = await leadsRef.add({
      customerName: data.customerName,
      email: data.email,
      phone: data.phone,

      pickupAddress: data.pickupAddress,
      pickupPostcode: clean(data.pickupPostcode),
      pickupPropertyType: data.pickupPropertyType,
      pickupBedrooms: clean(data.pickupBedrooms),
      pickupFloor: clean(data.pickupFloor),
      pickupLift: clean(data.pickupLift),
      pickupAccess: clean(data.pickupAccess),

      deliveryAddress: data.deliveryAddress,
      deliveryPostcode: clean(data.deliveryPostcode),
      deliveryPropertyType: data.deliveryPropertyType,
      deliveryFloor: clean(data.deliveryFloor),
      deliveryLift: clean(data.deliveryLift),
      deliveryAccess: clean(data.deliveryAccess),

      movingDate: clean(data.movingDate),
      dateFlexible: data.dateFlexible === "yes",
      serviceType: clean(data.serviceType),
      packingNeeded: clean(data.packingNeeded),
      dismantlingNeeded: clean(data.dismantlingNeeded),
      storageNeeded: clean(data.storageNeeded),
      heavyItems: clean(data.heavyItems),
      inventoryNotes: clean(data.inventoryNotes),
      specialInstructions: clean(data.specialInstructions),

      uploadedFiles: [] as {
        path: string;
        name: string;
        size: number;
        contentType: string;
      }[],
      submissionId: data.submissionId,
      source: "quote-form",
      status: "new",
      priority: "normal",
      assignedTo: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // ---- optional file uploads ----
    const uploaded = await handleLeadUploads(docRef.id, formData);
    if (uploaded.length) {
      await docRef.update({ uploadedFiles: uploaded });
    }

    await db.collection("activities").add({
      entityType: "lead",
      entityId: docRef.id,
      type: "created",
      actor: "system",
      metadata: { source: "quote-form", files: uploaded.length },
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
