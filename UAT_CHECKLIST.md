# UAT Checklist — Care4Removals

Run on **staging** with a real `FIREBASE_SERVICE_ACCOUNT_KEY`, a verified
Resend sender, and seeded staff accounts (one per role). Record pass/fail +
evidence. Nothing here has been executed yet — this build has had no access to
a configured Firebase project.

## Public website
- [ ] `/`, `/services`, `/about`, `/faqs`, `/contact`, `/get-a-quote`,
      `/legal/*` load with no console errors
- [ ] Old URLs redirect: `/index.html`→`/`, `/quote.html`→`/get-a-quote`,
      `/faq.html`→`/faqs`, `/admin/login.html`→`/admin/login`
- [ ] Mobile nav opens/closes (button, link tap, Escape), scroll locks
- [ ] No horizontal overflow at 320 / 375 / 768 / 1024 / 1440
- [ ] Keyboard: skip link works, focus visible, nav reachable, `aria-current`
      on the active item
- [ ] Reduced-motion setting removes animations, content still visible

## Enquiry → lead
- [ ] Valid quote submission → exactly ONE `leads` doc, `source: quote-form`,
      `status: new`, a reference shown
- [ ] Double-click submit / reload-resubmit with same session → still ONE lead
- [ ] Past moving date → rejected server-side with an accessible error
- [ ] Invalid email / missing privacy checkbox → field errors, data preserved
      (text fields)
- [ ] Contact form: same, plus subject defaults to the non-selectable option
- [ ] Staff notification email arrives at the configured recipient
- [ ] Customer acknowledgement email arrives (valid customer address)
- [ ] `emailLogs` entries created with correct status

## Staff portal
- [ ] Signed-out `/admin/*` → redirect to `/admin/login`
- [ ] Wrong password → error, no session
- [ ] Firebase user WITHOUT a role claim → login rejected ("no staff access")
- [ ] admin / manager / staff can see + edit; **viewer is read-only everywhere**
- [ ] Leads list: pagination (seed >25), status filter, source filter, search
- [ ] Lead detail: assignment, internal note (not shown anywhere customer-facing),
      call/email log, status change **blocked** for a disallowed transition
      (e.g. new→won)
- [ ] Dashboard counts match the leads list
- [ ] `/admin/*` returns `noindex` (check response headers / meta)
- [ ] Public footer has NO admin link

## Quotation
- [ ] Qualify a lead → "Create quote" → `Q-00001` (sequential), lead →
      quote-in-preparation, source lead unchanged
- [ ] Add line items across categories → preview total correct for the VAT mode
- [ ] Save draft, reload → values persist
- [ ] Manual override with a reason → `price-override` activity recorded;
      without a reason on an adjusted price → still saves but no override note
- [ ] "Save & send" → immutable `quoteVersions` v1, quote → sent, lead →
      quote-sent, `quote-sent` activity, customer email + PDF attachment
- [ ] Edit + send again → v2 created, v1 unchanged and still listed
- [ ] PDF: matches the on-screen version exactly, readable on desktop + mobile,
      contains NO cost/margin/internal notes
- [ ] Resend → same version, no new version, new email

## Customer quote experience
- [ ] Valid token link opens the latest version only
- [ ] First open flips sent→viewed (once) + `quote-viewed` activity
- [ ] Expired token → "expired" message, no data
- [ ] Revoked / malformed / random token → generic "link isn't valid"
- [ ] Accept without ticking terms → blocked
- [ ] Accept → quote accepted, lead won, exact version + timestamp + IP
      recorded, staff notified
- [ ] Re-submit the same response → idempotent (no error, no duplicate)
- [ ] Try to accept an already-declined/expired/converted quote → blocked
- [ ] Decline / Request changes → correct status + message
- [ ] PDF download via `/api/quote-pdf/[token]` works for a valid token, 404s
      for an expired/revoked one

## Job conversion
- [ ] Convert only available on an accepted quote
- [ ] Convert once → job with frozen snapshot (customer, addresses, date,
      service, total, line items), lineage links present, quote →
      converted-to-job, lead → won
- [ ] Convert again → returns the SAME job, no duplicate
- [ ] Edit the quote afterward → job snapshot unchanged
- [ ] Job status transitions follow the allowed map; completed/cancelled terminal

## Security spot-checks
- [ ] Unauthenticated Firestore read of `leads` / `quotes` / `jobs` / `customers`
      / `documents` → denied (use the Rules Playground or a script)
- [ ] `customerTokens` unreadable by any client
- [ ] `quoteVersions` not client-writable
- [ ] A `viewer` calling a write server action → "not authorised"

## Release gate
- [ ] `npm run lint` + `npx tsc --noEmit` + `npm test` + `npm run build` pass
- [ ] Rules unit tests pass (once written)
- [ ] No critical/high defect open
- [ ] DEPLOYMENT.md rollback steps dry-run understood
- [ ] Production deploy has explicit sign-off
