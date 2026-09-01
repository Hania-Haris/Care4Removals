import { z } from "zod";

/**
 * Environment variable validation — Phase 3.
 * Fails fast at startup rather than surfacing a confusing runtime error deep
 * inside a Firebase call. Public (`NEXT_PUBLIC_*`) vars are safe to expose to
 * the client per Firebase's own security model (protection comes from
 * security rules, not from hiding the config). Server-only vars must never
 * be prefixed NEXT_PUBLIC_ and must never be read from client components.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),
});

// Treat an empty-string env var (e.g. `FOO=` in .env.local) as "not set".
const optionalStr = z.preprocess(
  (v) => (v === "" || v === undefined ? undefined : v),
  z.string().optional()
);

const serverOnlySchema = z.object({
  // Optional at the schema level so importing this module doesn't crash local
  // dev before a service account key exists; getFirebaseAdminApp() enforces
  // its presence at call time with a helpful message.
  FIREBASE_SERVICE_ACCOUNT_KEY: optionalStr,
  RESEND_API_KEY: optionalStr, // required starting Phase 7
  LEAD_NOTIFICATION_EMAIL: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.string().email().optional()
  ),
});

export function getClientEnv() {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  });

  if (!parsed.success) {
    throw new Error(
      `Missing/invalid Firebase client environment variables: ${parsed.error.issues
        .map((i) => i.path.join("."))
        .join(", ")}. Copy .env.local.example to .env.local and fill it in.`
    );
  }

  return parsed.data;
}

export function getServerEnv() {
  const parsed = serverOnlySchema.safeParse({
    FIREBASE_SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    LEAD_NOTIFICATION_EMAIL: process.env.LEAD_NOTIFICATION_EMAIL,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid server-only environment variables: ${parsed.error.issues
        .map((i) => i.path.join("."))
        .join(", ")}`
    );
  }

  return parsed.data;
}
