"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { requireStaff } from "@/lib/auth/session";
import { SETTINGS_DOC_ID } from "@/lib/settings";
import {
  settingsSchema,
  parseServiceCatalog,
} from "@/lib/validation/settings";

export type SettingsActionResult = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

export async function updateSettings(
  _prev: SettingsActionResult,
  formData: FormData
): Promise<SettingsActionResult> {
  let user;
  try {
    user = await requireStaff();
  } catch {
    return { ok: false, message: "Your session has expired — sign in again." };
  }
  // Only admin / manager may change business settings.
  if (user.role !== "admin" && user.role !== "manager") {
    return { ok: false, message: "Only an admin or manager can change settings." };
  }

  const raw = {
    legalEntityName: formData.get("legalEntityName"),
    coverageAreaText: formData.get("coverageAreaText"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    contactAddress: formData.get("contactAddress"),
    vatMode: formData.get("vatMode"),
    quoteValidityDays: formData.get("quoteValidityDays"),
    depositEnabled: formData.get("depositEnabled") === "on",
    managerReviewRequired: formData.get("managerReviewRequired") === "on",
    termsText: formData.get("termsText"),
    emailSenderAddress: formData.get("emailSenderAddress"),
    emailRecipientAddress: formData.get("emailRecipientAddress"),
    serviceCatalogRaw: formData.get("serviceCatalogRaw"),
  };

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0]?.toString();
      if (k && !fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const d = parsed.data;
  const serviceCatalog = parseServiceCatalog(d.serviceCatalogRaw);
  if (serviceCatalog.length === 0) {
    return {
      ok: false,
      message: "Add at least one service to the catalog.",
      fieldErrors: { serviceCatalogRaw: "At least one service is required." },
    };
  }

  try {
    const db = getAdminDb();
    await db
      .collection("settings")
      .doc(SETTINGS_DOC_ID)
      .set(
        {
          legalEntityName: d.legalEntityName,
          coverageAreaText: d.coverageAreaText,
          contactEmail: d.contactEmail,
          contactPhone: d.contactPhone,
          contactAddress: d.contactAddress,
          serviceCatalog,
          vatMode: d.vatMode,
          quoteValidityDays: d.quoteValidityDays,
          depositEnabled: d.depositEnabled,
          managerReviewRequired: d.managerReviewRequired,
          termsText: d.termsText,
          emailSenderAddress: d.emailSenderAddress,
          emailRecipientAddress: d.emailRecipientAddress,
          updatedBy: user.uid,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    await db.collection("activities").add({
      entityType: "settings",
      entityId: SETTINGS_DOC_ID,
      type: "settings-updated",
      actor: user.uid,
      metadata: { by: user.email },
      createdAt: FieldValue.serverTimestamp(),
    });

    // Bust the 5-minute settings cache immediately + refresh dependent pages.
    revalidateTag("settings", { expire: 0 });
    revalidatePath("/admin/settings");
    revalidatePath("/legal/privacy");
    revalidatePath("/legal/terms");

    return { ok: true, message: "Settings saved." };
  } catch (e) {
    console.error("updateSettings failed:", e);
    return { ok: false, message: "Could not save settings. Please try again." };
  }
}
