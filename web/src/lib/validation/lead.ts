import { z } from "zod";

// Shared client/server validation schemas — server validation is the
// authoritative copy (enforced in app/actions/leads.ts); the client uses the
// same schema so error messages match, per Phase 4 of the brief.

const nonEmptyTrimmed = (max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be under ${max} characters.`);

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const optStr = (max: number) => z.string().trim().max(max).optional().default("");

export const quoteFormSchema = z.object({
  customerName: nonEmptyTrimmed(200, "Full name"),
  phone: nonEmptyTrimmed(50, "Phone number"),
  email: z.string().trim().email("Enter a valid email address.").max(200),

  // ---- current property ----
  pickupAddress: nonEmptyTrimmed(300, "Current address"),
  pickupPostcode: optStr(12),
  pickupPropertyType: nonEmptyTrimmed(50, "Current property type"),
  pickupBedrooms: optStr(20),
  pickupFloor: optStr(20),
  pickupLift: optStr(12),
  pickupAccess: optStr(400),

  // ---- new property ----
  deliveryAddress: nonEmptyTrimmed(300, "New address"),
  deliveryPostcode: optStr(12),
  deliveryPropertyType: nonEmptyTrimmed(50, "New property type"),
  deliveryFloor: optStr(20),
  deliveryLift: optStr(12),
  deliveryAccess: optStr(400),

  // ---- move ----
  movingDate: z
    .string()
    .optional()
    .default("")
    .refine(
      (val) => val === "" || val >= todayISO(),
      "Moving date can't be in the past."
    ),
  dateFlexible: optStr(12),
  serviceType: optStr(50),
  packingNeeded: optStr(20),
  dismantlingNeeded: optStr(20),
  storageNeeded: optStr(20),
  heavyItems: optStr(600),
  inventoryNotes: optStr(2000),
  specialInstructions: optStr(2000),

  privacyAcknowledged: z
    .union([z.literal("on"), z.literal("true"), z.undefined()])
    .refine((v) => v === "on" || v === "true", {
      message: "You must acknowledge the privacy notice to continue.",
    }),
  // Idempotency key — a fresh UUID generated once per form mount client-side.
  // A duplicate submit (double-click, retry) carries the same key, so the
  // server can recognize and no-op it instead of creating a second lead.
  submissionId: z.string().uuid("Invalid submission — please reload the page."),
});

// Upload limits — enforced server-side.
export const UPLOAD_MAX_FILES = 6;
export const UPLOAD_MAX_BYTES = 8 * 1024 * 1024;
export const UPLOAD_ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];

export type QuoteFormInput = z.infer<typeof quoteFormSchema>;

export const contactFormSchema = z.object({
  name: nonEmptyTrimmed(200, "Name"),
  phone: nonEmptyTrimmed(50, "Phone number"),
  email: z.string().trim().email("Enter a valid email address.").max(200),
  subject: nonEmptyTrimmed(100, "Subject"),
  message: nonEmptyTrimmed(2000, "Message"),
  privacyAcknowledged: z
    .union([z.literal("on"), z.literal("true"), z.undefined()])
    .refine((v) => v === "on" || v === "true", {
      message: "You must acknowledge the privacy notice to continue.",
    }),
  submissionId: z.string().uuid("Invalid submission — please reload the page."),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
