import type { LeadStatus } from "@/lib/types";

// Pure constants — no server-only imports — so unit tests and client code
// can use them.

export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "quote-in-preparation",
  "quote-sent",
  "won",
  "lost",
  "archived",
];

// Allowed status transitions — a lead can't jump straight from "new" to
// "won". Enforced server-side in the updateLeadStatus action.
export const LEAD_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  new: ["contacted", "qualified", "lost", "archived"],
  contacted: ["qualified", "lost", "archived"],
  qualified: ["quote-in-preparation", "lost", "archived"],
  "quote-in-preparation": ["quote-sent", "qualified", "lost", "archived"],
  "quote-sent": ["won", "lost", "quote-in-preparation", "archived"],
  won: ["archived"],
  lost: ["archived", "new"],
  archived: ["new"],
};
