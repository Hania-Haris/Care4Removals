# Decisions Required — Business Configuration

Status as agreed 2026-09-01 with Tayyab (m.tayyabi2822@gmail.com). Items marked
**"Admin-editable"** are stored in the Firestore `settings` collection and changeable
from `/admin/settings` without a redeploy — not hardcoded, not a config file.

| # | Decision | Status tonight | Storage |
|---|---|---|---|
| 1 | Legal entity on quotes/invoices | Placeholder: "Care4Removals" | Admin-editable |
| 2 | Coverage area | Leeds + Birmingham | Admin-editable |
| 3 | Contact identity (email/phone/address) | Email: m.tayyabi2822@gmail.com (verification/testing address). Phone/address unchanged from current site pending correction. | Admin-editable |
| 4 | Services offered | Current site's listed services confirmed as-is | Admin-editable (service catalog) |
| 5 | Pricing rules | Manual entry only — no auto-calc formula in v1 | N/A (staff types total per quote) |
| 6 | Tax/VAT treatment | Not registered / no VAT line by default | Admin-editable toggle (none / inclusive / exclusive) |
| 7 | Quote validity period | 14 days default | Admin-editable |
| 8 | Payments/deposit | No deposit collection in v1 — feature flagged off | Config flag, off |
| 9 | Terms (cancellation, damage, liability, etc.) | Placeholder draft text, marked "pending legal review" | Admin-editable (rich text) |
| 10 | Insurance wording | No insurance claim shown anywhere | Omitted until confirmed |
| 11 | Manager review gate before send | Off — any staff can send a quote directly | Config flag, off (togglable later) |
| 12 | Email provider / sender / recipient | Provider: Resend (free tier). Sender: Resend sandbox/onboarding address until a verified domain is supplied. Recipient for lead alerts: m.tayyabi2822@gmail.com | `RESEND_API_KEY` env var (server-only), sender/recipient admin-editable |
| 13 | Data retention | 24 months, then archived | Documented policy; enforcement job deferred past v1 |
| 14 | Customer acceptance mechanism | Simple "I Accept" click, timestamp + IP logged. No e-signature compliance claimed. | N/A |

## Explicitly NOT decided — do not build against these as if confirmed

- Exact legal company name/registration number
- Final phone number / office address (currently carried over from live site unverified)
- Full service catalog beyond what's already on the live site
- Any specific price rates (labour/vehicle/mileage/materials)
- VAT registration status (may need revisiting — currently "not registered" is a placeholder, not a confirmed fact)
- Final terms & conditions text — legal wording, not just placeholder copy
- Insurance cover and permitted wording
- Custom email sending domain (Resend sandbox sender is not suitable for production deliverability — a verified domain is needed before real launch)

## Rule enforced in code

Per the brief: unknown business values are never hardcoded into logic or shown to
customers as if confirmed. Anything in the "NOT decided" list stays behind a flag,
placeholder label, or is simply omitted from customer-facing output.
