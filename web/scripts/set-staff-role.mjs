// One-off helper to grant a Firebase Auth user a Care4Removals staff role.
//
// Usage (from web/):
//   FIREBASE_SERVICE_ACCOUNT_KEY=<base64> node scripts/set-staff-role.mjs \
//     user@example.com admin
//
// Roles: admin | manager | staff | viewer
//
// It sets the `role` custom claim (what the session cookie and security rules
// trust) AND upserts the users/{uid} Firestore document. The user must sign
// out and back in for a new claim to take effect in their token.

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const [, , email, role] = process.argv;
const VALID = ["admin", "manager", "staff", "viewer"];

if (!email || !VALID.includes(role)) {
  console.error(
    `Usage: node scripts/set-staff-role.mjs <email> <${VALID.join("|")}>`
  );
  process.exit(1);
}

const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!key) {
  console.error("FIREBASE_SERVICE_ACCOUNT_KEY (base64 of the service account JSON) is required.");
  process.exit(1);
}

const serviceAccount = JSON.parse(Buffer.from(key, "base64").toString("utf-8"));
initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db = getFirestore();

const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { role });
await db.collection("users").doc(user.uid).set(
  {
    email: user.email,
    displayName: user.displayName ?? user.email,
    role,
    active: true,
    updatedAt: FieldValue.serverTimestamp(),
  },
  { merge: true }
);

console.log(`✓ ${email} (${user.uid}) is now "${role}". They must re-authenticate.`);
