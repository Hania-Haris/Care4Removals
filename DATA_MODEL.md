# Data Model — Care4Removals Platform

All collections live in the existing Firebase project `care4removals-fd53c` (see
SECURITY_MODEL.md for the environment-isolation caveat). All IDs are Firestore
auto-IDs unless noted. All timestamps are `serverTimestamp()` — never client clocks.

## users
Staff accounts (mirrors Firebase Auth UID as document ID).
```
uid            (doc id, = Firebase Auth UID)
email          string
displayName    string
role           "admin" | "manager" | "staff" | "viewer"
active         boolean
createdAt      timestamp
```

## customers
Deduplicated by email+phone where possible; created from first lead.
```
name, email, phone
createdAt, updatedAt
```

## leads
Raw incoming enquiries (quote requests + contact messages unified conceptually,
but kept as they are today — see note below).
```
customerName, email, phone
pickupAddress, pickupPropertyType, pickupGroundFloor
deliveryAddress, deliveryPropertyType, deliveryGroundFloor
movingDate, dateFlexible
serviceType, packingNeeded, dismantlingNeeded, storageNeeded
specialInstructions
source            "quote-form" | "contact-form"
status            "new" | "contacted" | "qualified" | "quote-in-preparation"
                  | "quote-sent" | "won" | "lost" | "archived"
assignedTo        uid | null
priority          "normal" | "high"
uploadedFiles     [ { path, name, size, contentType } ]
createdAt, updatedAt
```
Note: existing `bookings` and `contactMessages` collections are the current
implementation of this concept, kept separate by form origin. Phase 3 will decide
whether to merge them into one `leads` collection with a `source` field (recommended)
or keep them split — recorded here as an open implementation decision, not a business one.

## quotes
```
leadId, customerId
quoteNumber        string, server-generated, sequential/unique
status             "draft" | "ready-for-review" | "sent" | "viewed"
                   | "changes-requested" | "accepted" | "declined"
                   | "expired" | "converted-to-job"
currentVersionId   -> quoteVersions doc id
expiresAt          timestamp
createdBy          uid
createdAt, updatedAt
```

## quoteVersions (immutable once sent)
```
quoteId
versionNumber      integer, incrementing
lineItems          [ { description, category, quantity, unitPrice, total } ]
subtotal, tax, total
assumptions, exclusions, paymentTerms, cancellationTerms   (strings, pulled from settings at time of creation)
overrideReason     string | null   (required if any manual price override applied)
pdfStoragePath     string | null
issuedAt           timestamp | null
createdBy          uid
createdAt          timestamp
```

## customerTokens
```
quoteId
token              cryptographically random string (not the doc id)
expiresAt          timestamp
revoked            boolean
createdAt          timestamp
```

## jobs
```
quoteId, quoteVersionId, leadId, customerId   (full lineage preserved)
snapshot           { customer, addresses, date, services, price, lineItems } — frozen copy
status             "pending-confirmation" | "confirmed" | "scheduled"
                   | "in-progress" | "completed" | "cancelled"
createdAt, updatedAt
```

## activities (audit trail)
```
entityType   "lead" | "quote" | "job"
entityId
type         "created" | "assigned" | "status-changed" | "price-override"
             | "quote-issued" | "quote-sent" | "quote-viewed"
             | "quote-response" | "converted"
actor        uid | "customer" | "system"
metadata     object (varies by type)
createdAt    timestamp
```

## documents
```
entityType, entityId
storagePath, fileName, contentType, size
uploadedBy   uid | "public"
createdAt
```

## emailLogs
```
entityType, entityId
provider "resend"
to, templateType
status   "queued" | "sent" | "delivered" | "bounced" | "failed"
providerMessageId
createdAt, updatedAt
```

## settings (singleton doc, admin-editable — see DECISIONS_REQUIRED.md)
```
doc id: "general"
legalEntityName, coverageAreaText, contactEmail, contactPhone, contactAddress
serviceCatalog        [ { id, label, active } ]
vatMode                "none" | "inclusive" | "exclusive"
quoteValidityDays       number
depositEnabled          boolean
termsText               string
managerReviewRequired   boolean
emailSenderAddress, emailRecipientAddress
updatedBy, updatedAt
```

## Indexes anticipated (finalized in Phase 3/11)
- `leads`: composite on `status` + `createdAt desc`
- `quotes`: composite on `status` + `createdAt desc`
- `jobs`: composite on `status` + `createdAt desc`
- `activities`: composite on `entityType` + `entityId` + `createdAt desc`
