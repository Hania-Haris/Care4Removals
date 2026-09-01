import "server-only";
import { unstable_cache } from "next/cache";
import { getAdminDb } from "@/lib/firebase/admin";

// Admin-editable business settings — see DECISIONS_REQUIRED.md.
// Defaults below match what was agreed with Tayyab for tonight's build.
// The actual /admin/settings CRUD UI is a Phase 5 deliverable; this module
// is the read path other phases (2, 6, 7, 8) build on in the meantime.

export type ServiceCatalogItem = { id: string; label: string; active: boolean };

export type Settings = {
  legalEntityName: string;
  coverageAreaText: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  serviceCatalog: ServiceCatalogItem[];
  vatMode: "none" | "inclusive" | "exclusive";
  quoteValidityDays: number;
  depositEnabled: boolean;
  termsText: string;
  managerReviewRequired: boolean;
  emailSenderAddress: string;
  emailRecipientAddress: string;
};

export const DEFAULT_SETTINGS: Settings = {
  legalEntityName: "Care4Removals",
  coverageAreaText: "Leeds & Birmingham",
  contactEmail: "m.tayyabi2822@gmail.com",
  contactPhone: "0113 248 8181",
  contactAddress: "188a Roundhay Road, Leeds, LS8 5PL",
  serviceCatalog: [
    { id: "house-removal", label: "House Removal", active: true },
    { id: "packing", label: "Packing", active: true },
    { id: "transport", label: "Reliable Transport", active: true },
  ],
  vatMode: "none",
  quoteValidityDays: 14,
  depositEnabled: false,
  termsText:
    "Draft terms — pending legal review. Cancellation, rescheduling, damage " +
    "and liability terms will be confirmed and replace this placeholder " +
    "before any quote is treated as binding.",
  managerReviewRequired: false,
  emailSenderAddress: "onboarding@resend.dev",
  emailRecipientAddress: "m.tayyabi2822@gmail.com",
};

const SETTINGS_DOC_ID = "general";

/**
 * Reads the singleton settings document, falling back to DEFAULT_SETTINGS
 * for any field that hasn't been set yet (e.g. before /admin/settings has
 * ever been saved). Never throws for a missing document — that's the normal
 * state before Phase 5's admin UI exists.
 */
async function readSettings(): Promise<Settings> {
  try {
    const snap = await getAdminDb().collection("settings").doc(SETTINGS_DOC_ID).get();
    if (!snap.exists) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<Settings>) };
  } catch (error) {
    console.error("readSettings() failed, using defaults:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Cached settings read. Settings change rarely (admin edits), so this is
 * cached for 5 minutes to collapse what would otherwise be a Firestore read
 * on every quote action, customer view, and legal-page hit into ~1 read per
 * 5 minutes. `revalidateTag("settings")` in the settings-save action busts
 * it immediately.
 */
export const getSettings = unstable_cache(readSettings, ["care4-settings"], {
  revalidate: 300,
  tags: ["settings"],
});
