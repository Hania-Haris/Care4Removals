import "server-only";
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
export async function getSettings(): Promise<Settings> {
  try {
    const snap = await getAdminDb().collection("settings").doc(SETTINGS_DOC_ID).get();

    if (!snap.exists) {
      return DEFAULT_SETTINGS;
    }

    return { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<Settings>) };
  } catch (error) {
    // If the Admin SDK isn't configured yet (local dev without a service
    // account key), fail safe to defaults rather than crashing every page.
    console.error("getSettings() failed, using defaults:", error);
    return DEFAULT_SETTINGS;
  }
}
