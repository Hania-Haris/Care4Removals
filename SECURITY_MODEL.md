# Security Model

## Implementation status (Phase 3)

- `firestore.rules` and `storage.rules` written at repo root, matching the
  intent below. **Not yet deployed** — deploying requires the Firebase CLI
  authenticated to the project, which needs to happen from a machine with
  console access; not done as part of this session to avoid touching the
  live project's rules without a deliberate, confirmed step.
- `web/src/lib/firebase/admin.ts` — server-only Admin SDK wrapper, gated by
  the `server-only` package so importing it from a client component is a
  build error, not just a lint warning.
- `web/src/lib/env.ts` — validates required environment variables at
  startup via `zod`, separated into client-safe and server-only schemas.
- Role enforcement is designed around a custom claim (`role`) on the Firebase
  Auth token, set only via the Admin SDK — not yet wired up because no
  `users` documents or admin auth flow exist yet (Phase 5).
- Rules unit tests (Firebase emulator) — **not yet written**, tracked as a
  Phase 3 exit-gate gap, to close before Phase 5 auth work is considered done.

## Environment isolation — OPEN RISK

The repo currently has exactly one Firebase project, `care4removals-fd53c`, which
is also the live production project (`.firebaserc` `default` alias). There is no
staging or dev project configured.

**Decision for tonight:** build and test the new platform against this same project
under the `dev` branch, using clearly namespaced/flagged test data (e.g. leads with
`source: "quote-form"` created by us will be visibly test data by content, not by
a separate project). This is a deliberate, temporary deviation from the brief's
"separate environments" requirement, accepted to move fast tonight.
**Before any production traffic depends on this build**, a genuine second Firebase
project (or Firebase's multi-site/App Check environments) must be created for
staging, and this file updated. Tracked as a Phase 11 blocker.

## Roles

| Role | Can |
|---|---|
| admin | everything, including settings, user management, all quotes/jobs |
| manager | leads, quotes, jobs — no user management |
| staff | leads, quotes (create/send since manager-review is off), jobs |
| viewer | read-only across leads/quotes/jobs |

Roles are stored on the `users/{uid}` document and mirrored into a **custom claim**
(`role`) on the Firebase Auth token so server-side checks (API routes / security
rules) never trust a client-supplied role.

## Firestore rules — intent (implemented in Phase 3)

- `leads`: `create` allowed for anyone (validated: required fields present, string
  length caps, no extra fields) — `read`/`list`/`update`/`delete` denied to
  unauthenticated users entirely; staff roles required for all of those.
- `quotes`, `quoteVersions`, `jobs`, `activities`, `documents`, `emailLogs`, `users`,
  `settings`: no public access at all — staff-role read, admin/manager/staff write
  per the role table above, `viewer` read-only.
- `customerTokens`: **no direct Firestore read/write from any client.** The
  token-verification flow runs entirely through a server-only Next.js route that
  validates the token, checks `expiresAt`/`revoked`, then returns only the
  customer-safe subset of the matching `quoteVersion` — the client never queries
  Firestore directly for this data.
- Storage rules mirror this: uploaded lead attachments write to a path scoped by
  lead ID with size/type validation; generated PDFs are staff/token-gated read only.

## Customer quote tokens

- Generated server-side using a CSPRNG (`crypto.randomBytes`), not derived from any
  document ID or quote number.
- Stored in `customerTokens` with `expiresAt` and `revoked`.
- Verified only via a server route — see above. Expired/revoked/superseded tokens
  return a generic "this link is no longer valid" response, not a distinguishing
  error (avoids leaking which failure mode occurred).

## What's explicitly deferred past tonight (documented, not silently skipped)

- Formal penetration-style security rule test suite (Firebase emulator + rules
  unit tests) — Phase 3 exit gate item, to be run before declaring Phase 3 done.
- Rate limiting on public form submissions (App Check + a lightweight per-IP
  counter) — implemented but not load-tested tonight.
- Full audit-log review tooling / alerting.
- Real second Firebase project for true environment isolation (see above).
