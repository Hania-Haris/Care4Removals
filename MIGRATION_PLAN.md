# Migration Plan

Branch: `dev` (created from `main` at commit `5884d57`). No deploy, no DNS change,
no production overwrite without explicit approval — per brief.

## Page/feature → target mapping

| Current | Target route | Change |
|---|---|---|
| index.html | `/` | Componentized, SSG, dup-nav bug N/A (didn't have it) |
| about.html | `/about` | Componentized, remove inline dup-nav script |
| services.html | `/services` | Componentized, remove inline dup-nav script, service list from `settings.serviceCatalog` |
| faq.html | `/faqs` | Componentized, remove inline dup-nav script, expanded per Phase 2 |
| contact.html | `/contact` | Rebuilt ContactForm component, server action for submission |
| quote.html | `/get-a-quote` | Rebuilt QuoteForm component, expanded fields (Phase 4), server action |
| 404.html | Next.js `not-found.tsx` | |
| index-backup.html, index-finished.html | **deleted** | dead files, not part of migration |
| admin/login.html | `/admin/login` | Server-verified session, noindex |
| admin/dashboard.html | `/admin/dashboard`, `/admin/leads` | Split into dashboard summary + full leads list w/ pagination |
| admin/booking.html | `/admin/leads/[id]` | Renamed to match "lead" terminology; adds quote-creation entry point |
| js/main.js | Layout-level nav/menu logic, single source | Removes duplication permanently — impossible to have the bug again since only one component owns it |
| js/firebase-config.js | `lib/firebase/client.ts` + `lib/firebase/admin.ts` | Split client SDK config from server-only Admin SDK usage |
| js/auth.js | `/admin/login` page + server session cookie | |
| js/contact.js, js/quote.js | Server actions (`app/actions/*.ts`) | Client no longer writes to Firestore directly |
| js/dashboard.js, js/booking.js | React components + server-fetched data, paginated | |
| — (new) | `/admin/quotes/[id]`, `/admin/jobs/[id]`, `/admin/settings` | New Phase 6/9 surfaces |
| — (new) | `/quote/[token]` | New Phase 8 secure customer view |

## Redirects
Old `.html` URLs → new clean routes, via `next.config.js` `redirects()`:
`/index.html`→`/`, `/about.html`→`/about`, `/services.html`→`/services`,
`/faq.html`→`/faqs`, `/contact.html`→`/contact`, `/quote.html`→`/get-a-quote`.

## Sequencing for tonight

Given the size of the full 12-phase brief, tonight's session executes phases in
order but scoped to reach a working demo end-to-end rather than full production
hardening of every phase. Each phase below is marked with tonight's actual scope;
anything deferred is listed explicitly rather than silently dropped.

- **Phase 0** ✅ this document + the other 4 planning docs.
- **Phase 1** — Next.js scaffold, migrate all 6 public pages, fix nav bug, basic a11y (skip link, focus states, aria-current). Full WCAG AA audit deferred to Phase 10 as the brief itself schedules it.
- **Phase 2** — Content pass using the confirmed decisions; FAQ expansion done for the sections we have real answers to.
- **Phase 3** — Data model + Firestore rules deployed to the *single existing project* (see SECURITY_MODEL.md environment-isolation risk). Rules unit tests: basic coverage tonight, not exhaustive.
- **Phase 4** — Expanded quote/contact forms with server actions, validation, idempotent lead creation.
- **Phase 5** — Staff auth + leads dashboard with pagination.
- **Phase 6** — Quote engine with manual line items and versioning.
- **Phase 7** — PDF generation + Resend email (sandbox sender).
- **Phase 8** — Tokenized customer quote view with accept/decline/request-changes.
- **Phase 9** — Job conversion.
- **Phase 10/11** — Deferred to a follow-up pass: full cross-browser/device QA, formal UAT script execution, monitoring/backup setup, rollback rehearsal. These require actual human testing time beyond what's achievable in this session — will be documented as open items in the Final Completion Report rather than claimed done.

## Non-goals confirmed with Tayyab tonight
No production deploy. No DNS change. No real customer data. No payment collection.
