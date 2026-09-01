import "server-only";
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getServerEnv } from "@/lib/env";

// Server-only Firebase Admin SDK. Never import this from a client component —
// the `server-only` import above makes that a build error, not just a
// convention. This is the ONLY place privileged operations (role checks,
// price calculation, quote-number generation, token issuance) may run.

let cachedApp: App | undefined;

function getFirebaseAdminApp(): App {
  if (cachedApp) return cachedApp;

  if (getApps().length) {
    cachedApp = getApps()[0]!;
    return cachedApp;
  }

  const env = getServerEnv();

  if (!env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not set. Generate a service account " +
        "key from Firebase Console > Project Settings > Service Accounts, " +
        "base64-encode the JSON, and set it as FIREBASE_SERVICE_ACCOUNT_KEY " +
        "in .env.local (server-only, never commit it)."
    );
  }

  const serviceAccountJson = Buffer.from(
    env.FIREBASE_SERVICE_ACCOUNT_KEY,
    "base64"
  ).toString("utf-8");

  const serviceAccount = JSON.parse(serviceAccountJson);

  const projectId =
    serviceAccount.project_id ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  cachedApp = initializeApp({
    credential: cert(serviceAccount),
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      (projectId ? `${projectId}.appspot.com` : undefined),
  });

  return cachedApp;
}

export function getAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getAdminDb() {
  return getFirestore(getFirebaseAdminApp());
}

export function getAdminStorage() {
  return getStorage(getFirebaseAdminApp());
}
