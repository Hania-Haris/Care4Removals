import { z } from "zod";

// Shape of the /admin/settings form. Kept separate from lib/settings.ts so
// the client form can import it without pulling server-only code.

export const settingsSchema = z.object({
  legalEntityName: z.string().trim().min(1).max(120),
  coverageAreaText: z.string().trim().min(1).max(160),
  contactEmail: z.string().trim().email().max(160),
  contactPhone: z.string().trim().max(40),
  contactAddress: z.string().trim().max(240),
  vatMode: z.enum(["none", "inclusive", "exclusive"]),
  quoteValidityDays: z.coerce.number().int().min(1).max(365),
  depositEnabled: z.coerce.boolean(),
  managerReviewRequired: z.coerce.boolean(),
  termsText: z.string().trim().max(6000),
  emailSenderAddress: z.string().trim().email().max(160),
  emailRecipientAddress: z.string().trim().email().max(160),
  // service catalog is edited as a newline list of "label" entries; an
  // inactive service is prefixed with "-".
  serviceCatalogRaw: z.string().max(2000),
});

export type SettingsFormInput = z.infer<typeof settingsSchema>;

export function parseServiceCatalog(raw: string) {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const active = !line.startsWith("-");
      const label = active ? line : line.slice(1).trim();
      return {
        id: label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        label,
        active,
      };
    })
    .filter((s) => s.id);
}

export function serviceCatalogToRaw(
  items: { label: string; active: boolean }[]
): string {
  return items.map((s) => (s.active ? s.label : `-${s.label}`)).join("\n");
}
