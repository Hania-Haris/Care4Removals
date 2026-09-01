# QA Results — Phase 0 Baseline Audit

Repo audited at commit `5884d57` (main), branch `dev` created from it.
Live deployment referenced by the brief: https://care4removals-fd53c.web.app/index.html
Firebase project: `care4removals-fd53c` (single project — no staging/prod separation exists today; see SECURITY_MODEL.md).

## Confirmed defects

1. **Duplicate `mobileMenuBtn`/`mobileNav` declaration — reproducible SyntaxError.**
   `js/main.js` declares `const mobileMenuBtn` and `const mobileNav` at module load on every page that includes it. `about.html`, `services.html`, `faq.html`, `contact.html`, and `quote.html` each *also* inline a second `<script>` block re-declaring the same `const` names. Result: `Uncaught SyntaxError: Identifier 'mobileMenuBtn' has already been declared` on every internal page, which halts the rest of the inline script (including the redundant nav-close logic) — the nav still visually works only because `main.js`'s listener registered first and the syntax error is thrown by the *second* script tag, not the first. `index.html` does not have the inline duplicate and is unaffected.
   Fix: remove the inline duplicate script block from all 5 pages; `main.js` already covers it.

2. **Dead files committed:** `index-backup.html`, `index-finished.html` — stale copies, not linked from anywhere, ship to production as-is via `firebase.json`'s `public: "."`.

3. **`js/dashboard.js` / `js/booking.js` unbounded reads** — `getDocs` with no `limit()`, fetch entire `bookings` + `contactMessages` collections on every dashboard load.

4. **`orderBy("createdAt", "desc")` on both dashboard queries** — a booking/message written in the same session before its `serverTimestamp()` resolves can be silently excluded from the ordered result set until it commits.

5. **No Firestore security rules file in the repo.** Cannot confirm current read/write rules from source; must be inspected directly in the Firebase console (see SECURITY_MODEL.md, item 1).

6. **No environment separation** — one Firebase project (`care4removals-fd53c`) serves as both the live site and (implicitly) any future dev/staging work. `firebase-config.js` hardcodes the API key/project inline — fine to expose per Firebase's model, but there is no mechanism today to point local dev at a different project.

7. **Public footer likely links the admin login** (present in nav across pages) — brief requires removing this; needs page-by-page confirmation in Phase 1/5.

8. **No `noindex` on `/admin/*`** — no `robots.txt`/meta robots tags found anywhere in repo.

9. **Branding inconsistency** — copy says "Care4Removals," logo asset is `care4properties-logo-transparent.png`. Relationship between the two names is one of the 14 business decisions (now: editable in admin settings, placeholder for tonight).

10. **Forms write directly to Firestore from the client** (`js/quote.js`, `js/contact.js`) with no server-side validation, no rate limiting, no spam control, no email notification on new lead — matches brief's Phase 4 concerns exactly.

## Confirmed working

- `contactMessages` and `bookings` writes succeed client-side with `status: "new"` and dual `createdAt`/`updatedAt` timestamps — **submissions are real, not simulated.**
- Admin dashboard (`dashboard.js`, `booking.js`) correctly escapes all interpolated Firestore values via `escapeHtml` before injecting into the DOM — no stored-XSS in the current admin views.
- `auth.js` uses Firebase `signInWithEmailAndPassword` correctly, redirects unauthenticated users away from `dashboard.html`/`booking.html` via `onAuthStateChanged`.

## Inventory

| Page | Scripts loaded | Firestore collection | Notes |
|---|---|---|---|
| index.html | main.js | — | no inline duplicate bug |
| about.html | main.js + inline dup | — | bug present |
| services.html | main.js + inline dup | — | bug present |
| faq.html | main.js + inline dup | — | bug present |
| contact.html | main.js + inline dup, contact.js | contactMessages | bug present |
| quote.html | main.js + inline dup, quote.js | bookings | bug present |
| admin/login.html | auth.js | — (Firebase Auth) | |
| admin/dashboard.html | dashboard.js | bookings, contactMessages (read/update) | unbounded reads |
| admin/booking.html | booking.js | bookings (read/update) | |
| 404.html | none | — | |

Full page-to-target-route mapping is in MIGRATION_PLAN.md.
