import "server-only";
import { Resend } from "resend";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { getServerEnv } from "@/lib/env";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
  from: string;
  attachments?: { filename: string; content: Buffer }[];
  // For emailLogs
  entityType: string;
  entityId: string;
  templateType: string;
};

export type EmailResult = { ok: boolean; id?: string; error?: string };

/**
 * Sends a transactional email via Resend and records the attempt in
 * emailLogs. If RESEND_API_KEY isn't set (local dev / not configured yet) it
 * logs a "skipped" entry and returns ok:false with a clear reason rather than
 * throwing — callers treat email as best-effort, never blocking the quote
 * workflow. No email secret or full body is stored in the log.
 */
export async function sendTransactionalEmail(
  payload: EmailPayload
): Promise<EmailResult> {
  const db = getAdminDb();
  const logRef = db.collection("emailLogs").doc();

  const baseLog = {
    entityType: payload.entityType,
    entityId: payload.entityId,
    provider: "resend",
    to: payload.to,
    templateType: payload.templateType,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  const env = getServerEnv();
  if (!env.RESEND_API_KEY) {
    await logRef.set({
      ...baseLog,
      status: "skipped",
      note: "RESEND_API_KEY not configured",
    });
    return { ok: false, error: "Email provider not configured." };
  }

  await logRef.set({ ...baseLog, status: "queued" });

  try {
    const resend = new Resend(env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      attachments: payload.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
    });

    if (error) {
      await logRef.update({
        status: "failed",
        note: error.message?.slice(0, 300) ?? "unknown",
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { ok: false, error: error.message };
    }

    await logRef.update({
      status: "sent",
      providerMessageId: data?.id ?? null,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { ok: true, id: data?.id };
  } catch (e) {
    await logRef.update({
      status: "failed",
      note: e instanceof Error ? e.message.slice(0, 300) : "unknown",
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { ok: false, error: "Email send failed." };
  }
}
