# Care4Removals — Final Completion Report

Branch: `dev` (from `main` @ `5884d57`). Not deployed. Legacy site + admin at
the repo root are untouched and remain the live/deployable artifact.

## 1. Delivered functionality by phase

| Phase | Delivered |
|---|---|
| 0 | Repo audit, 5 planning docs (MIGRATION_PLAN, DATA_MODEL, SECURITY_MODEL, DECISIONS_REQUIRED, QA_RESULTS) |
| 1 | Next.js 16 + TS app in `web/`; all 6 public pages migrated to clean routes with `.html` redirects; shared Header/Footer/ScrollReveal; **fixed** the duplicate-`mobileMenuBtn` SyntaxError and the wrong-class mobile-nav bug (menu never opened on the live site); a11y baseline |
| 2 | Quote form no longer offers unconfirmed Office Move / Storage; homepage process-card link fixed; repetitive-sections consolidation documented as deferred |
| 3 | `firestore.rules` + `storage.rules` (public create-only leads, no public reads, immutable quoteVersions, unreadable customerTokens); indexes; zod env validation; split client / server-only Firebase SDK; typed `settings` reader with agreed defaults |
| 4 | Server-action forms: zod validation (server authoritative), idempotent lead creation, past-date rejection, non-selectable contact subject, accessible errors, required privacy checkbox, data preserved on error |
| 5 | Firebase-Auth staff login → httpOnly session cookie (rejects non-staff), role from token claim, `(protected)` layout + edge proxy, admin `noindex`; leads list (cursor pagination, filters, search), lead detail (assignment, allowed-transition status, internal notes, call/email log), dashboard count tiles; `set-staff-role.mjs` |
| 6 | Quote engine: transactional sequential `Q-NNNNN`, mutable draft, deterministic server-side totals (unit-tested), manual override with audited reason, **immutable** `quoteVersions` on send, manager-review gate honoured, source lead never overwritten |
| 7 | `@react-pdf/renderer` branded quote PDF from immutable version data (no cost/margin), stored in protected Storage; Resend email + `emailLogs`; lead notification + customer acknowledgement + quotation email; resend action reuses the version |
| 8 | Token-gated `/quote/[token]` customer view (safe subset only), first-view tracking, Accept/Decline/Request-changes in a transaction (idempotent, replay-safe, terms-ack required, rejects expired/revoked/superseded/finalised, records version+timestamp+IP), token-validated PDF proxy |
| 9 | Convert accepted quote → job: once only (transactional), frozen snapshot, full lineage, job status transition map |
| 10 | Legal pages (privacy/terms/cookies, draft-marked, settings-driven); metadataBase/canonical/OG/Twitter; sitemap; MovingCompany JSON-LD (no invented claims); security headers; footer legal links |
| 11 | This report; DEPLOYMENT.md (env, rules deploy, cutover, rollback, monitoring); UAT_CHECKLIST.md; `seed-demo.mjs` |

## 2. Route map

Public (static): `/` `/services` `/about` `/faqs` `/contact` `/get-a-quote`
`/legal/privacy` `/legal/terms` `/legal/cookies` `/sitemap.xml` `/robots.txt`
Dynamic: `/quote/[token]`, `/api/quote-pdf/[token]`
Admin (dynamic, noindex): `/admin/login`, `/admin/dashboard`, `/admin/leads`,
`/admin/leads/[id]`, `/admin/quotes/[id]`, `/admin/jobs`, `/admin/jobs/[id]`,
`/api/admin/session`
Edge proxy: `/admin/:path*` cookie-presence gate.

## 3. Data model

Collections: `leads`, `customers`, `quotes` (+ mutable draft fields),
`quoteVersions` (immutable), `customerTokens`, `jobs`, `activities` (audit),
`documents`, `emailLogs`, `users`, `settings` (singleton `general`),
`counters` (quote numbering). Full field lists in `DATA_MODEL.md`.

## 4. Firestore indexes, rules, roles

Indexes: `firestore.indexes.json` (leads/quotes/jobs on status+createdAt,
activities on entityType+entityId+createdAt).
Rules: `firestore.rules`, `storage.rules`.
Roles (token custom claim): admin (all + users + settings), manager (all ops,
no user mgmt), staff (leads/quotes/jobs), viewer (read-only).

## 5. Environment variables (names only)

`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`,
`NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`,
`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`,
`NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`, `NEXT_PUBLIC_SITE_URL`,
`FIREBASE_SERVICE_ACCOUNT_KEY` (server), `RESEND_API_KEY` (server),
`LEAD_NOTIFICATION_EMAIL` (server).

## 6. Automated checks

- `npm run lint` — 0 errors (1 known non-blocking next/font warning)
- `npx tsc --noEmit` — clean
- `npm test` (vitest) — 15 pass: quote calc (6), lead transitions (5), job transitions (4)
- `npm run build` — 22 routes, clean
- Accessibility: automated axe/Lighthouse pass **not yet run** (needs deploy)
- UAT: **not yet run** — see UAT_CHECKLIST.md

## 7. Known limitations / deferred

1. **Nothing has run against a real Firebase project** — no service account key
   in this environment. All Admin-SDK paths are built and fail gracefully
   without it. Forms, auth, quotes, PDF, email, customer portal, jobs all need
   a configured project to exercise end to end.
2. **Environment isolation** — one Firebase project. Needs a real staging
   project before production (SECURITY_MODEL.md).
3. **Firestore/Storage rules not deployed**, and **no rules unit test suite**
   (Firebase emulator) yet — carried from Phase 3.
4. **Email needs a verified Resend domain**; sandbox sender only reaches the
   account owner.
5. **`<select>` values not preserved** on a form validation error (text fields
   are).
6. **Expanded quote-form fields** (lift/parking/bedrooms/heavy items) and
   **inventory image upload** not added — legacy field set + privacy checkbox.
7. **Rate limiting / App Check / spam control** not implemented — idempotency
   key stops accidental dupes only.
8. **Repetitive homepage sections** not consolidated (QA_RESULTS.md).
9. **Full WCAG AA audit, cross-browser/device matrix, Lighthouse perf,
   analytics + consent, CSP header, production canonical host** — deferred to a
   QA pass on a running staging deploy.
10. Legal copy is **draft**, pending real legal review (DECISIONS_REQUIRED.md).

## 8. Deploy / rollback

See `DEPLOYMENT.md`. Summary: deploy rules+indexes, deploy `web/` to Vercel or
Firebase App Hosting with env vars, create first admin via `set-staff-role.mjs`,
run UAT on staging, then (approval-gated) cut the domain over. Rollback: revert
the deploy / repoint DNS to the untouched legacy Firebase Hosting site.

## 9. Business decisions still open

Legal entity, coverage wording, final contact details, full service catalog,
pricing rates, VAT status, final terms text, insurance wording, custom email
domain — all captured in `DECISIONS_REQUIRED.md` and either admin-editable or
behind placeholders/flags. None are hardcoded into logic.
