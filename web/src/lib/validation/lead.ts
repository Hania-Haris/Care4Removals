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

export const quoteFormSchema = z.object({
  customerName: nonEmptyTrimmed(200, "Full name"),
  phone: nonEmptyTrimmed(50, "Phone number"),
  email: z.string().trim().email("Enter a valid email address.").max(200),
  pickupAddress: nonEmptyTrimmed(300, "Current address"),
  pickupPropertyType: nonEmptyTrimmed(50, "Current property type"),
  pickupGroundFloor: z.string().max(10).optional().default(""),
  deliveryAddress: nonEmptyTrimmed(300, "New address"),
  deliveryPropertyType: nonEmptyTrimmed(50, "New property type"),
  deliveryGroundFloor: z.string().max(10).optional().default(""),
  movingDate: z
    .string()
    .optional()
    .default("")
    .refine(
      (val) => val === "" || val >= todayISO(),
      "Moving date can't be in the past."
    ),
  serviceType: z.string().max(50).optional().default(""),
  specialInstructions: z.string().max(2000).optional().default(""),
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
