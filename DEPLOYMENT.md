# Deployment & Rollback Runbook

The Next.js app lives in `web/`. The legacy static site at the repo root is
**still what `firebase.json` deploys** (`"public": "."` with `web/**` ignored) —
so nothing about the live site has changed yet. Switching the live site to the
Next app is a deliberate, separate step (below), gated on explicit approval.

## 1. Prerequisites (one-time)

### Firebase projects
- **Environment isolation is still an open item** (SECURITY_MODEL.md). Before
  production traffic depends on this build, create a second Firebase project
  for staging (e.g. `care4removals-staging`) and add it as a `.firebaserc`
  alias. Until then, staging = the same project with clearly-fake data.

### Service account
1. Firebase Console → Project Settings → Service Accounts → Generate new private key.
2. `base64 -i service-account.json | tr -d '\n'` → set as `FIREBASE_SERVICE_ACCOUNT_KEY`
   in the hosting platform's env (never commit it).

### Environment variables (names only — see web/.env.local.example)
| Var | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | client | safe to expose |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | server | base64 service account JSON |
| `RESEND_API_KEY` | server | from resend.com; until set, emails log "skipped" |
| `NEXT_PUBLIC_SITE_URL` | both | absolute origin, e.g. https://care4removals.co.uk |

### First staff user
```
cd web
FIREBASE_SERVICE_ACCOUNT_KEY=<base64> node scripts/set-staff-role.mjs you@example.com admin
```
Then create the Firebase Auth user (Console → Authentication) if it doesn't
exist, and sign in at `/admin/login`. The user must re-authenticate after the
role is set.

### Email sender domain
Resend's sandbox sender (`onboarding@resend.dev`) only delivers to the account
owner. For real customer delivery: add + verify a domain in Resend, then set
`emailSenderAddress` in `/admin/settings` (or the settings doc) to an address
on it.

## 2. Deploy Firestore rules + indexes

```
npx firebase-tools deploy --only firestore:rules,firestore:indexes,storage --project <project>
```
Rules files: `firestore.rules`, `storage.rules`. Indexes: `firestore.indexes.json`.
**Do this before** the app goes live — the app assumes these rules are active.

## 3. Deploy the Next.js app

Two supported targets:

### Option A — Vercel (simplest)
1. Import the repo, set **Root Directory = `web`**.
2. Add the env vars from the table above.
3. Deploy. Preview deployments per PR come free.

### Option B — Firebase App Hosting (keeps one console)
1. `firebase experiments:enable webframeworks` (or use App Hosting).
2. Point it at `web/`, add env vars (server ones as secrets).
3. `firebase deploy`.

## 4. Cut the live site over to the Next app (approval-gated)

Only when staging UAT has passed and you're ready:
- **Vercel/App Hosting**: point the production domain at the new deployment.
- **Staying on Firebase Hosting for static + a rewrite**: not recommended —
  the app is server-rendered. Use A or B.
- Keep `firebase.json` `hosting` as a fallback until DNS has propagated.

## 5. Rollback

| Scenario | Action |
|---|---|
| App deploy is bad | Vercel: "Instant Rollback" to the previous deployment. App Hosting: redeploy the previous commit. |
| DNS cutover is bad | Repoint the domain back to Firebase Hosting (the legacy static site is untouched and still deployable with `firebase deploy --only hosting`). |
| Bad Firestore rules | `git revert` the rules change, redeploy `--only firestore:rules`. Rules deploys are near-instant. |
| Bad data from a migration | No destructive migration is performed by this project. Individual bad docs: fix/delete in the Console. |

The legacy site + old admin (`admin/*.html`, `js/*.js`) remain in the repo and
deployable throughout — that's the ultimate rollback.

## 6. Cost & quota controls (Blaze plan)

The project is on Blaze (pay-as-you-go) because Storage requires it. The build
is designed to stay inside the free allowances at realistic volume:

| Service | Free allowance | What the app does | Guard |
|---|---|---|---|
| Firestore reads | 50k/day | Marketing pages are **static** (0 reads). Admin dashboard ≈ 1 read/60s (cached). Settings ≈ 1 read/5min (cached). A lead view ≈ 3–5 reads. | caching + `.limit()` everywhere |
| Firestore writes | 20k/day | 1 lead ≈ 2 writes + 3 rate-limit writes. A quote send ≈ 5 writes. | public-form rate limit (per-IP 4/hr·12/day, global 250/day, fails closed) |
| Storage stored | 5 GB | quote PDFs ≈ 3–5 KB each (~1M PDFs to fill 5 GB) | none needed |
| Storage downloads | 1 GB/day | customer PDF views, proxied | low volume |
| Resend emails | 100/day, 3,000/mo | lead ≈ 2, quote send ≈ 1, customer response ≈ 1 | daily cap **90/day** in code |

**If you ever see cost:** the first place to look is the `rateLimits` and
`emailLogs` collections and Firestore usage graphs. A spike almost certainly
means the public form is being scripted — the rate limiter caps the damage,
but you can also tighten `LIMITS` in `src/lib/rate-limit.ts` or add Firebase
**App Check** (Console banner) which blocks non-app traffic entirely.

**App Check** is optional here: public writes go through server actions (Admin
SDK, not subject to App Check) and the public site makes no client-side
Firestore/Storage calls, so the rate limiter is the effective guard. Add App
Check if you later expose any client-side Firestore access.

## 7. Monitoring checklist (post-launch)

- [ ] Firebase Console → Firestore usage (watch read/write spikes = missing pagination or abuse)
- [ ] `emailLogs` collection — `status: "failed"` entries
- [ ] Resend dashboard — bounce/complaint rate
- [ ] Hosting platform error logs / function logs
- [ ] Auth → sign-in activity (unexpected accounts)
- [ ] A weekly check that no `leads`/`quotes` are readable unauthenticated
      (run the rules test suite once it exists)
