// Shared domain types — mirrors DATA_MODEL.md. Single source of truth so
// Phases 4-9 don't redefine these ad hoc.

export type UserRole = "admin" | "manager" | "staff" | "viewer";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "quote-in-preparation"
  | "quote-sent"
  | "won"
  | "lost"
  | "archived";

export type QuoteStatus =
  | "draft"
  | "ready-for-review"
  | "sent"
  | "viewed"
  | "changes-requested"
  | "accepted"
  | "declined"
  | "expired"
  | "converted-to-job";

export type JobStatus =
  | "pending-confirmation"
  | "confirmed"
  | "scheduled"
  | "in-progress"
  | "completed"
  | "cancelled";

export type LeadSource = "quote-form" | "contact-form";

export type LeadFile = {
  path: string;
  name: string;
  size: number;
  contentType: string;
};

export type Lead = {
  id: string;
  customerName: string;
  email: string;
  phone: string;

  pickupAddress?: string;
  pickupPostcode?: string | null;
  pickupPropertyType?: string;
  pickupBedrooms?: string | null;
  pickupFloor?: string | null;
  pickupLift?: string | null;
  pickupAccess?: string | null;
  pickupGroundFloor?: string; // legacy

  deliveryAddress?: string;
  deliveryPostcode?: string | null;
  deliveryPropertyType?: string;
  deliveryFloor?: string | null;
  deliveryLift?: string | null;
  deliveryAccess?: string | null;
  deliveryGroundFloor?: string; // legacy

  movingDate?: string | null;
  dateFlexible?: boolean;
  serviceType?: string | null;
  packingNeeded?: string | null;
  dismantlingNeeded?: string | null;
  storageNeeded?: string | null;
  heavyItems?: string | null;
  inventoryNotes?: string | null;
  specialInstructions?: string | null;

  uploadedFiles?: LeadFile[];
  subject?: string; // contact-form only
  message?: string; // contact-form only
  source: LeadSource;
  status: LeadStatus;
  assignedTo?: string | null;
  priority: "normal" | "high";
};

export type LineItem = {
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type QuoteVersion = {
  id: string;
  quoteId: string;
  versionNumber: number;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  assumptions: string;
  exclusions: string;
  paymentTerms: string;
  cancellationTerms: string;
  overrideReason?: string | null;
  pdfStoragePath?: string | null;
  issuedAt?: string | null;
};

export type Quote = {
  id: string;
  leadId: string;
  customerId?: string;
  quoteNumber: string;
  status: QuoteStatus;
  currentVersionId?: string;
  expiresAt?: string;
};
